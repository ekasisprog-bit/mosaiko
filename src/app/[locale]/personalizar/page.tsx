import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MagnetBuilder } from '@/components/builder/MagnetBuilder';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'builder' });

  return {
    title: `${t('title')} — Mosaiko`,
    description: t('subtitle'),
    openGraph: {
      title: `${t('title')} — Mosaiko`,
      description: t('subtitle'),
      type: 'website',
    },
  };
}

export default async function PersonalizarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-cream">
      <MagnetBuilder />
    </main>
  );
}
