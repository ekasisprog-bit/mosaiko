'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageDropzoneProps {
  onFile: (file: File) => void;
  isUploading?: boolean;
  progress?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export function ImageDropzone({ onFile, isUploading, progress }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Solo se aceptan archivos PNG, JPEG o WebP.');
      return false;
    }
    if (file.size > MAX_SIZE) {
      setError('El archivo excede 10 MB.');
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && validate(file)) onFile(file);
  }, [onFile, validate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validate(file)) onFile(file);
  }, [onFile, validate]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={[
        'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
        isDragging
          ? 'border-terracotta bg-terracotta/5'
          : 'border-warm-gray/30 hover:border-terracotta/50 hover:bg-cream/50',
        isUploading ? 'pointer-events-none opacity-60' : '',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-warm-gray/20 border-t-terracotta" />
          <p className="text-sm text-warm-gray">
            {progress !== undefined ? `Subiendo... ${Math.round(progress)}%` : 'Analizando imagen...'}
          </p>
        </div>
      ) : (
        <>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7a6b5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-sm font-medium text-charcoal">
            Arrastra una imagen o haz clic para seleccionar
          </p>
          <p className="mt-1 text-xs text-warm-gray">
            PNG, JPEG o WebP — max 10 MB
          </p>
        </>
      )}

      {error && (
        <p className="mt-3 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
