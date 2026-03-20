import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin/auth';
import { updateProduct, deleteProduct } from '@/lib/admin/product-store';
import type { CategoryType } from '@/lib/customization-types';

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// PATCH /api/admin/products/[productId]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const { productId } = await params;
    const body = await request.json();
    const updates: Partial<{ name: string; category: CategoryType; price: number }> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.price !== undefined) updates.price = body.price;

    const product = await updateProduct(productId, updates);
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado o no es dinámico.' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error('[admin/products/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Error al actualizar producto.' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[productId]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const { productId } = await params;
    const deleted = await deleteProduct(productId);
    if (!deleted) {
      return NextResponse.json({ error: 'Producto no encontrado o no es dinámico.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/products/[id]] DELETE error:', err);
    return NextResponse.json({ error: 'Error al eliminar producto.' }, { status: 500 });
  }
}
