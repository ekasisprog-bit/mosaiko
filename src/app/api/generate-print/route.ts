import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { uploadPrintTiles } from '@/lib/storage';
import type { CategoryCustomization } from '@/lib/customization-types';
import { CATEGORY_REGISTRY } from '@/lib/customization-types';
import type { ProcessorResult } from '@/lib/print-pipeline/types';

// ─── Server-side CropArea (mirrors client-side CropArea without DOM deps) ───

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Request body shape ─────────────────────────────────────────────────────

interface GeneratePrintRequest {
  /** URL of the original photo (can be R2 public URL or external) */
  photoUrl: string;
  /** Category-specific customization config */
  customization: CategoryCustomization;
  /** Crop area selected by the user */
  cropArea: CropArea;
  /** Optional order ID -- generated if not provided */
  orderId?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB max for fetched images
const FETCH_TIMEOUT_MS = 15_000; // 15 second timeout for photo fetch

// ─── URL validation (SSRF prevention) ───────────────────────────────────────

const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL).hostname
  : 'r2.mosaiko.mx';

const ALLOWED_PHOTO_HOSTS = new Set([
  R2_PUBLIC_DOMAIN,
  'cdn.shopify.com',
]);

function validatePhotoUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid photo URL format');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Only HTTPS photo URLs are allowed');
  }

  if (!ALLOWED_PHOTO_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `Photo URL host not allowed: ${parsed.hostname}. ` +
      `Allowed: ${[...ALLOWED_PHOTO_HOSTS].join(', ')}`,
    );
  }
}

// ─── OrderId validation ─────────────────────────────────────────────────────

const ORDER_ID_PATTERN = /^[\w-]{1,128}$/;

function sanitizeOrderId(orderId?: string): string {
  if (!orderId) return crypto.randomUUID();
  if (!ORDER_ID_PATTERN.test(orderId)) {
    throw new Error('Invalid orderId format');
  }
  return orderId;
}

// ─── POST /api/generate-print ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GeneratePrintRequest;

    // ── Validate required fields ────────────────────────────────────────

    if (!body.photoUrl) {
      return NextResponse.json(
        { error: 'Missing required field: photoUrl' },
        { status: 400 },
      );
    }

    if (!body.customization || !body.customization.categoryType) {
      return NextResponse.json(
        { error: 'Missing required field: customization' },
        { status: 400 },
      );
    }

    // Validate categoryType is a known category
    if (!(body.customization.categoryType in CATEGORY_REGISTRY)) {
      return NextResponse.json(
        { error: `Unknown category type: ${body.customization.categoryType}` },
        { status: 400 },
      );
    }

    if (
      !body.cropArea ||
      typeof body.cropArea.x !== 'number' ||
      typeof body.cropArea.y !== 'number' ||
      typeof body.cropArea.width !== 'number' ||
      typeof body.cropArea.height !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid required field: cropArea (x, y, width, height)' },
        { status: 400 },
      );
    }

    // Validate crop area values are non-negative
    if (
      body.cropArea.x < 0 ||
      body.cropArea.y < 0 ||
      body.cropArea.width <= 0 ||
      body.cropArea.height <= 0
    ) {
      return NextResponse.json(
        { error: 'cropArea values must be non-negative (width/height must be positive)' },
        { status: 400 },
      );
    }

    // ── Validate photo URL (SSRF prevention) ────────────────────────────

    try {
      validatePhotoUrl(body.photoUrl);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid photo URL' },
        { status: 400 },
      );
    }

    // ── Validate and sanitize orderId ────────────────────────────────────

    let orderId: string;
    try {
      orderId = sanitizeOrderId(body.orderId);
    } catch {
      return NextResponse.json(
        { error: 'Invalid orderId format. Use alphanumeric, hyphens, underscores (max 128 chars).' },
        { status: 400 },
      );
    }

    // ── Fetch the source photo (with timeout + size cap) ────────────────

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let photoResponse: Response;
    try {
      photoResponse = await fetch(body.photoUrl, { signal: controller.signal });
    } catch (error) {
      clearTimeout(timeout);
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'Photo fetch timed out'
        : 'Failed to fetch photo';
      return NextResponse.json({ error: message }, { status: 422 });
    } finally {
      clearTimeout(timeout);
    }

    if (!photoResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch photo from URL: ${photoResponse.status}` },
        { status: 422 },
      );
    }

    // Check Content-Length before buffering
    const contentLength = photoResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `Photo too large (max ${MAX_IMAGE_SIZE / 1024 / 1024} MB)` },
        { status: 400 },
      );
    }

    const imageBuffer = Buffer.from(await photoResponse.arrayBuffer());

    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `Photo too large (max ${MAX_IMAGE_SIZE / 1024 / 1024} MB)` },
        { status: 400 },
      );
    }

    // ── Run the print pipeline ──────────────────────────────────────────

    const { processPrintJob } = await import('@/lib/print-pipeline');

    const result: ProcessorResult = await processPrintJob({
      imageBuffer,
      customization: body.customization,
      cropArea: body.cropArea,
      jobId: orderId,
    });

    // ── Upload tiles to R2 ──────────────────────────────────────────────

    const storedTiles = await uploadPrintTiles(
      orderId,
      result.tiles.map((tile) => ({
        index: tile.index,
        buffer: tile.buffer,
      })),
    );

    // ── Return tile info ────────────────────────────────────────────────

    const tiles = storedTiles.map((stored, i) => ({
      index: result.tiles[i].index,
      key: stored.key,
      url: stored.publicUrl,
    }));

    return NextResponse.json({
      orderId,
      categoryType: result.categoryType,
      tileCount: result.tileCount,
      tiles,
    });
  } catch (error) {
    console.error('[api/generate-print] Print generation failed:', error);

    // Distinguish known errors from unexpected ones
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Print generation failed. Please try again.' },
      { status: 500 },
    );
  }
}
