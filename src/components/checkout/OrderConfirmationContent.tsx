'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

interface OrderConfirmationContentProps {
  title: string;
  subtitle: string;
  timeline: string;
  backToStore: string;
}

export function OrderConfirmationContent({
  title,
  subtitle,
  timeline,
  backToStore,
}: OrderConfirmationContentProps) {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderNumber(params.get('order'));
  }, []);

  return (
    <>
      {/* Celebration icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-success/10">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-success"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="font-serif text-3xl font-bold text-teal md:text-4xl"
      >
        {title}
      </motion.h1>

      {/* Order number */}
      {orderNumber && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-3 text-lg font-semibold text-charcoal"
        >
          Pedido #{orderNumber}
        </motion.p>
      )}

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-3 max-w-md text-warm-gray"
      >
        {subtitle}
      </motion.p>

      {/* Timeline card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 w-full max-w-sm rounded-2xl border border-light-gray bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-teal"
            >
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <p className="text-left text-sm text-warm-gray">{timeline}</p>
        </div>
      </motion.div>

      {/* Back to store */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="mt-8"
      >
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-terracotta px-8 py-3 font-semibold text-white transition-colors hover:bg-terracotta-dark"
        >
          {backToStore}
        </Link>
      </motion.div>
    </>
  );
}
