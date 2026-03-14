'use client';

import type { OrderStatus } from '@/lib/shopify/queries/orders';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bgClass: string; textClass: string }> = {
  nuevo: { label: 'Nuevo', bgClass: 'bg-amber-100', textClass: 'text-amber-800' },
  imprimiendo: { label: 'Imprimiendo', bgClass: 'bg-blue-100', textClass: 'text-blue-800' },
  enviado: { label: 'Enviado', bgClass: 'bg-purple-100', textClass: 'text-purple-800' },
  entregado: { label: 'Entregado', bgClass: 'bg-emerald-100', textClass: 'text-emerald-800' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.nuevo;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bgClass} ${config.textClass}`}>
      {config.label}
    </span>
  );
}
