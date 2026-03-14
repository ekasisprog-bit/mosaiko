import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import crypto from 'node:crypto';

// ─── Environment ─────────────────────────────────────────────────────────────

const R2_BUCKET_UPLOADS = process.env.R2_BUCKET_UPLOADS ?? 'mosaiko-uploads';
const R2_BUCKET_PRINT_FILES =
  process.env.R2_BUCKET_PRINT_FILES ?? 'mosaiko-print-files';
const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL ?? 'https://r2.mosaiko.mx';

// ─── Environment validation ─────────────────────────────────────────────────

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[R2 Storage] Missing required environment variable: ${key}. ` +
      'Ensure R2 credentials are configured in .env.local',
    );
  }
  return value;
}

// ─── S3 Client ──────────────────────────────────────────────────────────────

/** Shared R2 client -- created lazily and reused across invocations. */
let _client: S3Client | null = null;
function getClient(): S3Client {
  if (!_client) {
    const accountId = getRequiredEnv('R2_ACCOUNT_ID');
    const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID');
    const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY');

    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return _client;
}

// ─── Key sanitization ───────────────────────────────────────────────────────

const SAFE_KEY_SEGMENT = /^[\w.-]{1,256}$/;

function sanitizeKeySegment(segment: string, label: string): string {
  if (!SAFE_KEY_SEGMENT.test(segment)) {
    throw new Error(
      `[R2 Storage] Invalid ${label}: must be alphanumeric, hyphens, underscores, dots (max 256 chars)`,
    );
  }
  return segment;
}

// ─── Upload original photo ──────────────────────────────────────────────────

/**
 * Uploads a user's original photo to the public uploads bucket.
 *
 * @param file      Raw file data as a Buffer
 * @param extension File extension without dot (e.g. "jpg", "png", "webp")
 * @returns         The storage key and public URL for the uploaded file
 */
export async function uploadOriginalPhoto(
  file: Buffer,
  extension: string,
): Promise<{ key: string; publicUrl: string }> {
  const client = getClient();
  const uuid = crypto.randomUUID();
  const safeExt = sanitizeKeySegment(extension, 'file extension');
  const key = `originals/${uuid}.${safeExt}`;

  const contentTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_UPLOADS,
      Key: key,
      Body: file,
      ContentType: contentTypeMap[extension.toLowerCase()] ?? 'application/octet-stream',
    }),
  );

  return {
    key,
    publicUrl: getPublicUrl(key),
  };
}

// ─── Upload print tiles ─────────────────────────────────────────────────────

/**
 * Uploads generated print tiles to the private print-files bucket.
 *
 * @param orderId Unique order/job identifier
 * @param tiles   Array of tile objects with index and buffer
 * @returns       Array of storage keys and URLs for each tile
 */
export async function uploadPrintTiles(
  orderId: string,
  tiles: { index: number; buffer: Buffer }[],
): Promise<{ key: string; publicUrl: string }[]> {
  const client = getClient();
  const safeOrderId = sanitizeKeySegment(orderId, 'orderId');

  const results = await Promise.all(
    tiles.map(async (tile) => {
      const key = `print-files/${safeOrderId}/tile-${tile.index}.png`;

      await client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_PRINT_FILES,
          Key: key,
          Body: tile.buffer,
          ContentType: 'image/png',
        }),
      );

      return { key, publicUrl: getPublicUrl(key) };
    }),
  );

  return results;
}

// ─── Get signed URL ─────────────────────────────────────────────────────────

/**
 * Generates a URL for accessing a private file.
 *
 * TODO: For production presigned URLs, install `@aws-sdk/s3-request-presigner`
 * and use its `getSignedUrl()` with `GetObjectCommand`. For now, this returns
 * the public URL pattern which works for the uploads bucket (public read).
 * For the print-files bucket (private), use the admin proxy endpoint instead:
 *   GET /api/admin/print-files?orderId=xxx
 *
 * @param key       The storage key of the file
 * @param _expiresIn Expiration in seconds (unused until presigner is added)
 */
export async function getSignedUrl(
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expiresIn: number = 3600,
): Promise<string> {
  // TODO: Replace with @aws-sdk/s3-request-presigner for true presigned URLs:
  //
  // import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
  // const command = new GetObjectCommand({ Bucket: R2_BUCKET_PRINT_FILES, Key: key });
  // return awsGetSignedUrl(getClient(), command, { expiresIn });
  //
  return getPublicUrl(key);
}

// ─── Get public URL ─────────────────────────────────────────────────────────

/**
 * Constructs the public URL for a file using the R2 custom domain.
 *
 * @param key The storage key of the file
 * @returns   Full public URL
 */
export function getPublicUrl(key: string): string {
  // Strip leading slash if present to avoid double slashes
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  return `${R2_PUBLIC_URL}/${cleanKey}`;
}

// ─── Get object stream (for admin proxy downloads) ──────────────────────────

/**
 * Retrieves a file from the print-files bucket as a readable stream.
 * Used by the admin print-files endpoint to proxy private downloads.
 *
 * @param key The storage key of the file
 * @returns   The S3 GetObjectCommand output (body is a ReadableStream)
 */
export async function getObject(bucket: 'uploads' | 'print-files', key: string) {
  const client = getClient();
  const bucketName =
    bucket === 'uploads' ? R2_BUCKET_UPLOADS : R2_BUCKET_PRINT_FILES;

  return client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}

// ─── List files by prefix ───────────────────────────────────────────────────

/**
 * Lists all objects in a bucket matching a given prefix.
 * Useful for finding all print tiles for an order.
 *
 * @param bucket The bucket to search
 * @param prefix Key prefix to filter by (e.g. "print-files/order123/")
 * @returns      Array of object keys matching the prefix
 */
export async function listFiles(
  bucket: 'uploads' | 'print-files',
  prefix: string,
): Promise<string[]> {
  const client = getClient();
  const bucketName =
    bucket === 'uploads' ? R2_BUCKET_UPLOADS : R2_BUCKET_PRINT_FILES;

  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    }),
  );

  return (response.Contents ?? [])
    .map((obj) => obj.Key)
    .filter((key): key is string => key !== undefined);
}

// ─── Delete file ────────────────────────────────────────────────────────────

/**
 * Deletes a file from the specified bucket.
 *
 * @param bucket Which bucket to delete from
 * @param key    The storage key of the file to delete
 */
export async function deleteFile(
  bucket: 'uploads' | 'print-files',
  key: string,
): Promise<void> {
  const client = getClient();
  const bucketName =
    bucket === 'uploads' ? R2_BUCKET_UPLOADS : R2_BUCKET_PRINT_FILES;

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}
