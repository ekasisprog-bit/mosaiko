import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin/auth';
import { detectSeams } from '@/lib/admin/seam-detection';
import { uploadBuffer } from '@/lib/storage';
import crypto from 'node:crypto';
import type { GridSize } from '@/lib/grid-config';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const MAGIC_BYTES: { prefix: number[]; type: string; extension: string }[] = [
  { prefix: [0xFF, 0xD8, 0xFF], type: 'image/jpeg', extension: 'jpg' },
  { prefix: [0x89, 0x50, 0x4E, 0x47], type: 'image/png', extension: 'png' },
  { prefix: [0x52, 0x49, 0x46, 0x46], type: 'image/webp', extension: 'webp' },
];

function detectImageType(buffer: Buffer): { type: string; extension: string } | null {
  for (const magic of MAGIC_BYTES) {
    if (magic.prefix.every((byte, i) => buffer[i] === byte)) {
      if (magic.type === 'image/webp') {
        const webpTag = buffer.subarray(8, 12).toString('ascii');
        if (webpTag !== 'WEBP') continue;
      }
      return { type: magic.type, extension: magic.extension };
    }
  }
  return null;
}

// POST /api/admin/products/analyze
export async function POST(request: NextRequest) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No se proporcionó archivo.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El archivo excede 10 MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageType = detectImageType(buffer);
    if (!imageType) {
      return NextResponse.json({ error: 'Tipo de archivo no soportado. Usa PNG, JPEG o WebP.' }, { status: 400 });
    }

    // Optional force grid from form data
    let forceGrid: { rows: number; cols: number; gridSize: GridSize } | undefined;
    const forceRows = formData.get('forceRows');
    const forceCols = formData.get('forceCols');
    const forceGridSize = formData.get('forceGridSize');
    if (forceRows && forceCols && forceGridSize) {
      forceGrid = {
        rows: Number(forceRows),
        cols: Number(forceCols),
        gridSize: Number(forceGridSize) as GridSize,
      };
    }

    // Run seam detection
    const detection = await detectSeams(buffer, forceGrid);

    // Upload temp image to R2
    const tempKey = `catalog/images/temp-${crypto.randomUUID()}.${imageType.extension}`;
    const { publicUrl } = await uploadBuffer('uploads', tempKey, buffer, imageType.type);

    return NextResponse.json({
      tempImageKey: tempKey,
      publicUrl,
      contentType: imageType.type,
      detection,
    });
  } catch (err) {
    console.error('[admin/products/analyze] Error:', err);
    return NextResponse.json({ error: 'Error al analizar imagen.' }, { status: 500 });
  }
}
