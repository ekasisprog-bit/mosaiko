import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin/auth';
import { updateOrderMetafield, createFulfillment } from '@/lib/shopify/mutations/orders';
import { sendShippingNotification } from '@/lib/email/resend-client';

// ─── PATCH /api/admin/orders/[orderId]/status ───────────────────────────────
//
// Updates order fulfillment status metafield.
// If status is "enviado", also creates Shopify fulfillment and sends shipping email.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  // Verify admin session
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { orderId } = await params;

  // Validate orderId format (prevent path traversal / injection)
  if (!/^[\w-]+$/.test(orderId)) {
    return NextResponse.json(
      { error: 'Formato de orderId inválido.' },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const { status, trackingNumber, trackingCompany, customerEmail, customerName, orderNumber } = body;

    const validStatuses = ['nuevo', 'imprimiendo', 'enviado', 'entregado'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Opciones: ${validStatuses.join(', ')}` },
        { status: 400 },
      );
    }

    // Update metafield
    await updateOrderMetafield(orderId, 'mosaiko', 'fulfillment_status', status);

    // If shipping, create fulfillment and send email
    if (status === 'enviado' && trackingNumber) {
      try {
        await createFulfillment(orderId, trackingNumber, trackingCompany);
      } catch (error) {
        console.error('[api/admin/orders/status] Fulfillment creation failed:', error);
      }

      if (customerEmail) {
        try {
          await sendShippingNotification({
            customerEmail,
            customerName,
            orderNumber: orderNumber || orderId,
            trackingNumber,
            trackingCompany,
          });
        } catch (error) {
          console.error('[api/admin/orders/status] Shipping email failed:', error);
        }
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('[api/admin/orders/status] Error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el estado.' },
      { status: 500 },
    );
  }
}
