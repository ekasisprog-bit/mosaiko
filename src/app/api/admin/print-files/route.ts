import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin/auth';
import { listFiles, getSignedUrl, getObject } from '@/lib/storage';
import archiver from 'archiver';
import { Readable } from 'node:stream';

// ─── GET /api/admin/print-files ─────────────────────────────────────────────
//
// Returns download URLs or streams ZIP for all print tiles of an order.
//
// Auth: JWT cookie (admin session)
//
// Query params:
//   orderId (required) — The order/job identifier
//   format  (optional) — "zip" to download all tiles as ZIP
//   tile    (optional) — Tile index for single tile download

export async function GET(request: NextRequest) {
  try {
    // ── Verify admin session ──────────────────────────────────────────
    const isAdmin = await verifySession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado.' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const format = searchParams.get('format');
    const tileIndex = searchParams.get('tile');

    // ── Validate orderId ──────────────────────────────────────────────
    if (!orderId) {
      return NextResponse.json(
        { error: 'Falta el parámetro orderId.' },
        { status: 400 },
      );
    }

    if (!/^[\w-]+$/.test(orderId)) {
      return NextResponse.json(
        { error: 'Formato de orderId inválido.' },
        { status: 400 },
      );
    }

    // ── List print tiles ──────────────────────────────────────────────
    const prefix = `print-files/${orderId}/`;
    const keys = await listFiles('print-files', prefix);

    if (keys.length === 0) {
      return NextResponse.json(
        { error: `No se encontraron archivos para el pedido: ${orderId}` },
        { status: 404 },
      );
    }

    // ── Single tile download ──────────────────────────────────────────
    if (tileIndex !== null) {
      const tileKey = keys.find((k) => k.includes(`tile-${tileIndex}.`));
      if (!tileKey) {
        return NextResponse.json(
          { error: `Tile ${tileIndex} no encontrado.` },
          { status: 404 },
        );
      }

      const obj = await getObject('print-files', tileKey);
      const body = obj.Body;
      if (!body) {
        return NextResponse.json({ error: 'Archivo vacío.' }, { status: 500 });
      }

      const byteArray = await body.transformToByteArray();
      return new NextResponse(Buffer.from(byteArray), {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="tile-${tileIndex}.png"`,
        },
      });
    }

    // ── ZIP download ──────────────────────────────────────────────────
    if (format === 'zip') {
      const archive = archiver('zip', { zlib: { level: 5 } });

      // Fetch all tiles and add to archive
      for (const key of keys) {
        const filename = key.split('/').pop() ?? key;
        const obj = await getObject('print-files', key);
        if (obj.Body) {
          const byteArray = await obj.Body.transformToByteArray();
          archive.append(Buffer.from(byteArray), { name: filename });
        }
      }

      archive.finalize();

      // Convert Node stream to Web ReadableStream
      const readable = Readable.toWeb(archive) as ReadableStream;

      return new NextResponse(readable, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="mosaiko-pedido-${orderId}.zip"`,
        },
      });
    }

    // ── Default: return list of download URLs ─────────────────────────
    const files = await Promise.all(
      keys.map(async (key) => {
        const filename = key.split('/').pop() ?? key;
        const downloadUrl = await getSignedUrl(key);
        return { key, filename, downloadUrl };
      }),
    );

    files.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

    return NextResponse.json({
      orderId,
      fileCount: files.length,
      files,
    });
  } catch (error) {
    console.error('[api/admin/print-files] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener archivos de impresión.' },
      { status: 500 },
    );
  }
}
