import { OrderDetailContent } from '@/components/admin/OrderDetailContent';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <OrderDetailContent orderId={orderId} />;
}
