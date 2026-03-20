'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PrintFile {
  key: string;
  filename: string;
  downloadUrl: string;
}

interface PrintFilesGridProps {
  orderId: string;
}

export function PrintFilesGrid({ orderId }: PrintFilesGridProps) {
  const [files, setFiles] = useState<PrintFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch(`/api/admin/print-files?orderId=${encodeURIComponent(orderId)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setFiles([]);
            return;
          }
          const data = await res.json();
          setError(data.error || 'Error al cargar archivos.');
          return;
        }
        const data = await res.json();
        setFiles(data.files);
      } catch {
        setError('Error de conexión.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchFiles();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-light-gray border-t-terracotta" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-cream p-4 text-center text-sm text-warm-gray">
        {error}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="rounded-lg bg-cream p-6 text-center">
        <p className="text-sm text-warm-gray">
          Los archivos de impresión se generan automáticamente cuando llega un pedido.
        </p>
      </div>
    );
  }

  const cols = files.length <= 4 ? 2 : 3;

  return (
    <div>
      {/* Tile grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {files.map((file, index) => (
          <motion.div
            key={file.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04 }}
            className="group relative overflow-hidden rounded-lg"
            style={{ border: '1px solid #e5e0d4' }}
          >
            <img
              src={file.downloadUrl}
              alt={file.filename}
              className="aspect-square w-full object-cover"
            />
            {/* Download overlay on hover */}
            <a
              href={`/api/admin/print-files?orderId=${encodeURIComponent(orderId)}&tile=${index}`}
              download={file.filename}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          </motion.div>
        ))}
      </div>

      {/* Download all as ZIP */}
      <a
        href={`/api/admin/print-files?orderId=${encodeURIComponent(orderId)}&format=zip`}
        download
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg font-medium text-white transition-colors"
        style={{ backgroundColor: '#422102' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Descargar todo (ZIP)
      </a>
    </div>
  );
}
