'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';

export function CheckoutButton() {
  const t = useTranslations('cart');
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const setCheckoutInProgress = useCartStore((s) => s.setCheckoutInProgress);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (isLoading || items.length === 0) return;

    setIsLoading(true);
    setCheckoutInProgress(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al procesar el pago.');
        return;
      }

      // Clear cart and redirect to Shopify checkout
      clearCart();
      window.location.href = data.checkoutUrl;
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setIsLoading(false);
      setCheckoutInProgress(false);
    }
  }

  return (
    <div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={handleCheckout}
        disabled={isLoading || items.length === 0}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cta text-base font-bold font-serif text-[var(--cta-text)] transition-colors hover:bg-[var(--cta-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="31.4 31.4"
                strokeLinecap="round"
              />
            </svg>
            Procesando...
          </>
        ) : (
          t('checkout')
        )}
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-center text-sm text-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
