import { NextRequest, NextResponse } from 'next/server';
import { uploadOriginalPhoto } from '@/lib/storage';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Magic byte signatures for image validation ─────────────────────────────

const MAGIC_BYTES: { prefix: number[]; type: string; extension: string }[] = [
  { prefix: [0xFF, 0xD8, 0xFF], type: 'image/jpeg', extension: 'jpg' },
  { prefix: [0x89, 0x50, 0x4E, 0x47], type: 'image/png', extension: 'png' },
  { prefix: [0x52, 0x49, 0x46, 0x46], type: 'image/webp', extension: 'webp' }, // RIFF header (WebP)
];

function detectImageType(buffer: Buffer): { type: string; extension: string } | null {
  for (const magic of MAGIC_BYTES) {
    if (magic.prefix.every((byte, i) => buffer[i] === byte)) {
      // Additional WebP check: bytes 8-11 must be "WEBP"
      if (magic.type === 'image/webp') {
        const webpTag = buffer.subarray(8, 12).toString('ascii');
        if (webpTag !== 'WEBP') continue;
      }
      return { type: magic.type, extension: magic.extension };
    }
  }
  return null;
}

// ─── POST /api/upload ────────────────────────────────────────────────────────

// TODO: Add rate limiting (implement with Vercel KV, Upstash, or similar)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    // ── Validate file exists ──────────────────────────────────────────────

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided. Send a file field in multipart/form-data.' },
        { status: 400 },
      );
    }

    // ── Validate file size ────────────────────────────────────────────────

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large: ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum is 10 MB.`,
        },
        { status: 400 },
      );
    }

    // ── Convert to Buffer and validate via magic bytes ────────────────────

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const detected = detectImageType(buffer);
    if (!detected) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 },
      );
    }

    const extension = detected.extension;

    const { key, publicUrl } = await uploadOriginalPhoto(buffer, extension);

    return NextResponse.json({ key, publicUrl }, { status: 201 });
  } catch (error) {
    console.error('[api/upload] Upload failed:', error);

    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 },
    );
  }
}
