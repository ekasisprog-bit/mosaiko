import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CartPage } from '@/components/cart/CartPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Tu carrito — Mosaiko',
};

export default async function CarritoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CartPage />;
}
