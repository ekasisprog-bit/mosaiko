'use client';

import { useState } from 'react';

interface ProductDeleteDialogProps {
  productName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ProductDeleteDialog({ productName, onConfirm, onCancel }: ProductDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-charcoal" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          Eliminar producto
        </h3>
        <p className="mt-2 text-sm text-warm-gray">
          ¿Estas seguro de eliminar <strong className="text-charcoal">{productName}</strong>?
          Esta accion no se puede deshacer.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-warm-gray transition-colors hover:bg-cream"
            style={{ border: '1px solid #e5e0d4' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
