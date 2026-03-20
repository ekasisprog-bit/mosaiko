import { CATEGORY_REGISTRY, type CategoryType } from './customization-types';
import { GRID_CONFIGS, type GridSize } from './grid-config';

// ─── Catalog product type ────────────────────────────────────────────────────

export interface CatalogProduct {
  id: string;
  category: CategoryType;
  name: string;
  price: number;
  image: string;
  pieces: number;
  grid: string;       // display: "3x3", "2x3"
  gridSize: GridSize;  // numeric: 3, 4, 6, 9
  originalImage: string;   // path to high-res source in _originals/
  isPredesigned: boolean;  // true = direct to preview, false = builder flow
}

// ─── Products ────────────────────────────────────────────────────────────────

export const PRODUCTS: CatalogProduct[] = [
  // Mosaicos — builder-only (user uploads their own photo)
  { id: 'mos-1', category: 'mosaicos', name: 'Mosaico Familiar 3x3', price: 480, image: '/products/mosaicos/familiar-9.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/mosaicos/familiar-9.png', isPredesigned: false },
  { id: 'mos-2', category: 'mosaicos', name: 'Mosaico Pareja 2x3', price: 360, image: '/products/mosaicos/pareja-6.png', pieces: 6, grid: '2x3', gridSize: 6, originalImage: '/products/_originals/mosaicos/pareja-6.png', isPredesigned: false },
  { id: 'mos-3', category: 'mosaicos', name: 'Mosaico Panoramico', price: 200, image: '/products/mosaicos/panoramico-3.png', pieces: 3, grid: '1x3', gridSize: 3, originalImage: '/products/_originals/mosaicos/panoramico-3.png', isPredesigned: false },
  { id: 'mos-4', category: 'mosaicos', name: 'Mosaico Mascota', price: 360, image: '/products/mosaicos/mascota-6.png', pieces: 6, grid: '2x3', gridSize: 6, originalImage: '/products/_originals/mosaicos/mascota-6.png', isPredesigned: false },
  { id: 'mos-5', category: 'mosaicos', name: 'Mosaico Recuerdo', price: 480, image: '/products/mosaicos/familiar-9-2.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/mosaicos/familiar-9-2.png', isPredesigned: false },
  { id: 'mos-6', category: 'mosaicos', name: 'Mosaico Tira', price: 200, image: '/products/mosaicos/panoramico-3-2.png', pieces: 3, grid: '1x3', gridSize: 3, originalImage: '/products/_originals/mosaicos/panoramico-3-2.png', isPredesigned: false },
  // Studio / Ghibli
  { id: 'ghi-1', category: 'ghibli', name: 'El Viaje de Chihiro', price: 480, image: '/products/ghibli/chihiro.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/ghibli/chihiro.png', isPredesigned: true },
  { id: 'ghi-2', category: 'ghibli', name: 'Mi Vecino Totoro', price: 480, image: '/products/ghibli/totoro.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/ghibli/totoro.png', isPredesigned: true },
  { id: 'ghi-3', category: 'ghibli', name: 'Princesa Mononoke', price: 480, image: '/products/ghibli/mononoke.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/ghibli/mononoke.png', isPredesigned: true },
  { id: 'ghi-4', category: 'ghibli', name: 'El Castillo Vagabundo', price: 480, image: '/products/ghibli/howl.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/ghibli/howl.png', isPredesigned: true },
  { id: 'ghi-5', category: 'ghibli', name: 'El Viaje de Chihiro II', price: 480, image: '/products/ghibli/chihiro-2.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/ghibli/chihiro-2.png', isPredesigned: true },
  { id: 'ghi-6', category: 'ghibli', name: 'Kiki Entregas a Domicilio', price: 480, image: '/products/ghibli/kiki.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/ghibli/kiki.png', isPredesigned: true },
  { id: 'ghi-7', category: 'ghibli', name: 'Ponyo', price: 480, image: '/products/ghibli/ponyo.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/ghibli/ponyo.png', isPredesigned: true },
  { id: 'ghi-8', category: 'ghibli', name: 'El Nino y la Garza', price: 480, image: '/products/ghibli/garza.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/ghibli/garza.png', isPredesigned: true },
  // Arte
  { id: 'art-1', category: 'arte', name: 'La Noche Estrellada', price: 480, image: '/products/arte/noche-estrellada.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/arte/noche-estrellada.png', isPredesigned: true },
  { id: 'art-2', category: 'arte', name: 'La Mona Lisa', price: 480, image: '/products/arte/mona-lisa.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/arte/mona-lisa.png', isPredesigned: true },
  { id: 'art-3', category: 'arte', name: 'El Beso — Klimt', price: 480, image: '/products/arte/el-beso.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/arte/el-beso.png', isPredesigned: true },
  { id: 'art-4', category: 'arte', name: 'La Gran Ola', price: 480, image: '/products/arte/gran-ola.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/arte/gran-ola.png', isPredesigned: true },
  { id: 'art-5', category: 'arte', name: 'La Joven de la Perla', price: 480, image: '/products/arte/joven-perla.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/arte/joven-perla.png', isPredesigned: true },
  { id: 'art-6', category: 'arte', name: 'Las Dos Fridas', price: 480, image: '/products/arte/dos-fridas.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/arte/dos-fridas.png', isPredesigned: true },
  { id: 'art-7', category: 'arte', name: 'Nenufares — Monet', price: 480, image: '/products/arte/nenufares.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/arte/nenufares.png', isPredesigned: true },
  { id: 'art-8', category: 'arte', name: 'El Nacimiento de Venus', price: 480, image: '/products/arte/venus.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/arte/venus.png', isPredesigned: true },
  // Save the Date
  { id: 'std-1', category: 'save-the-date', name: 'Boda Elegante', price: 480, image: '/products/save-the-date/boda-9.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/save-the-date/boda-9.png', isPredesigned: true },
  { id: 'std-2', category: 'save-the-date', name: 'Compromiso', price: 360, image: '/products/save-the-date/compromiso-6.png', pieces: 6, grid: '2x3', gridSize: 6, originalImage: '/products/_originals/save-the-date/compromiso-6.png', isPredesigned: true },
  { id: 'std-3', category: 'save-the-date', name: 'Baby Shower', price: 200, image: '/products/save-the-date/baby-3.png', pieces: 3, grid: '1x3', gridSize: 3, originalImage: '/products/_originals/save-the-date/baby-3.png', isPredesigned: true },
  // Tonos / Flores
  { id: 'flo-1', category: 'flores', name: 'Ramo de Rosas', price: 480, image: '/products/flores/rosas-9.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/flores/rosas-9.png', isPredesigned: true },
  { id: 'flo-2', category: 'flores', name: 'Girasoles', price: 200, image: '/products/flores/girasoles-3.png', pieces: 3, grid: '1x3', gridSize: 3, originalImage: '/products/_originals/flores/girasoles-3.png', isPredesigned: true },
  // Spotify
  { id: 'spo-1', category: 'spotify', name: 'Album Cover Custom', price: 480, image: '/products/spotify/album-1.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/spotify/album-1.png', isPredesigned: true },
  { id: 'spo-2', category: 'spotify', name: 'Personalizado', price: 480, image: '/products/spotify/personalizado.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/spotify/personalizado.png', isPredesigned: true },
  // Polaroid
  { id: 'pol-1', category: 'polaroid', name: 'Tu Foto Polaroid', price: 480, image: '/products/polaroid/clasico.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/polaroid/clasico.png', isPredesigned: true },
  { id: 'pol-2', category: 'polaroid', name: 'Polaroid Vintage', price: 480, image: '/products/polaroid/vintage.png', pieces: 9, grid: '3x3', gridSize: 9, originalImage: '/products/_originals/polaroid/vintage.png', isPredesigned: true },
];

// ─── Category display metadata ───────────────────────────────────────────────

export interface CatalogCategory {
  type: CategoryType;
  i18nKey: string;       // key under catalogPage.*
  accentColor: string;   // Tailwind bg class
  order: number;
  showPersonalizeCard: boolean; // false when products already include "tu foto" placeholders
}

// Lookup from kebab-case CategoryType to the camelCase i18n key used in catalogPage
const CATEGORY_I18N_MAP: Record<CategoryType, string> = {
  mosaicos: 'mosaicos',
  ghibli: 'ghibli',
  arte: 'arte',
  'save-the-date': 'saveTheDate',
  flores: 'flores',
  spotify: 'spotify',
  polaroid: 'polaroid',
};

export const CATEGORY_ACCENT: Record<CategoryType, string> = {
  mosaicos: 'bg-terracotta',
  ghibli: 'bg-charcoal',
  arte: 'bg-gold',
  'save-the-date': 'bg-terracotta-light',
  flores: 'bg-terracotta',
  spotify: 'bg-gold-dark',
  polaroid: 'bg-warm-gray',
};

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  { type: 'mosaicos', i18nKey: 'mosaicos', accentColor: 'bg-terracotta', order: 1, showPersonalizeCard: true },
  { type: 'ghibli', i18nKey: 'ghibli', accentColor: 'bg-charcoal', order: 2, showPersonalizeCard: true },
  { type: 'arte', i18nKey: 'arte', accentColor: 'bg-gold', order: 3, showPersonalizeCard: true },
  { type: 'save-the-date', i18nKey: 'saveTheDate', accentColor: 'bg-terracotta-light', order: 4, showPersonalizeCard: true },
  { type: 'flores', i18nKey: 'flores', accentColor: 'bg-terracotta', order: 5, showPersonalizeCard: true },
  { type: 'spotify', i18nKey: 'spotify', accentColor: 'bg-gold-dark', order: 6, showPersonalizeCard: false },
  { type: 'polaroid', i18nKey: 'polaroid', accentColor: 'bg-warm-gray', order: 7, showPersonalizeCard: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getProductById(id: string): CatalogProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(): Map<CategoryType, CatalogProduct[]> {
  const map = new Map<CategoryType, CatalogProduct[]>();
  for (const cat of CATALOG_CATEGORIES) {
    map.set(cat.type, []);
  }
  for (const product of PRODUCTS) {
    const list = map.get(product.category);
    if (list) list.push(product);
  }
  return map;
}

export function getCategoryI18nKey(type: CategoryType): string {
  return CATEGORY_I18N_MAP[type];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
