export type GridSize = 3 | 4 | 6 | 9;

export interface GridConfig {
  size: GridSize;
  rows: number;
  cols: number;
  aspect: number; // width / height
  price: number; // MXN
  label: string; // i18n key suffix
}

export const GRID_CONFIGS: Record<GridSize, GridConfig> = {
  3: {
    size: 3,
    rows: 1,
    cols: 3,
    aspect: 3 / 1,
    price: 200,
    label: 'grid3',
  },
  4: {
    size: 4,
    rows: 2,
    cols: 2,
    aspect: 1 / 1,
    price: 280,
    label: 'grid4',
  },
  6: {
    size: 6,
    rows: 3,
    cols: 2,
    aspect: 2 / 3,
    price: 360,
    label: 'grid6',
  },
  9: {
    size: 9,
    rows: 3,
    cols: 3,
    aspect: 1 / 1,
    price: 480,
    label: 'grid9',
  },
};

export const TILE_PRINT_SIZE = 827; // 7cm at 300dpi

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
