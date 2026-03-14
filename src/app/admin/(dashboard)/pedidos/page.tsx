import { OrdersListContent } from '@/components/admin/OrdersListContent';
import { OnboardingOverlay } from '@/components/admin/OnboardingOverlay';

export default function OrdersPage() {
  return (
    <>
      <OnboardingOverlay />
      <OrdersListContent />
    </>
  );
}
