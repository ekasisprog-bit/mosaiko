import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { OrderConfirmationContent } from '@/components/checkout/OrderConfirmationContent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('orderConfirmation');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function OrderConfirmationPage() {
  return <OrderConfirmationPageContent />;
}

function OrderConfirmationPageContent() {
  const t = useTranslations('orderConfirmation');

  return (
    <div className="container-mosaiko flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <OrderConfirmationContent
        title={t('title')}
        subtitle={t('subtitle')}
        timeline={t('timeline')}
        backToStore={t('backToStore')}
      />
    </div>
  );
}
