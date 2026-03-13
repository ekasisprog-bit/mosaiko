'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { GRID_CONFIGS, formatPrice, type GridSize } from '@/lib/grid-config';

interface GridSelectorProps {
  onSelect: (grid: GridSize) => void;
  selected: GridSize | null;
}

const GRID_OPTIONS: GridSize[] = [3, 4, 6, 9];

/** Visual SVG icon for each grid layout. */
function GridIcon({ size, isSelected }: { size: GridSize; isSelected: boolean }) {
  const config = GRID_CONFIGS[size];
  const fillColor = isSelected ? '#C4653A' : '#1B4D4F';
  const gap = 2;
  const viewSize = 48;
  const cellW = (viewSize - gap * (config.cols - 1)) / config.cols;
  const cellH = (viewSize - gap * (config.rows - 1)) / config.rows;

  return (
    <svg
      width={48}
      height={48}
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      aria-hidden="true"
      className="shrink-0"
    >
      {Array.from({ length: config.rows }).map((_, row) =>
        Array.from({ length: config.cols }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={col * (cellW + gap)}
            y={row * (cellH + gap)}
            width={cellW}
            height={cellH}
            rx={2}
            fill={fillColor}
            opacity={isSelected ? 0.9 : 0.6}
          />
        )),
      )}
    </svg>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export function GridSelector({ onSelect, selected }: GridSelectorProps) {
  const t = useTranslations('builder');

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-teal md:text-3xl">
          {t('stepGrid')}
        </h2>
        <p className="mt-2 text-sm text-warm-gray md:text-base">
          {t('subtitle')}
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 md:gap-4"
      >
        {GRID_OPTIONS.map((size) => {
          const config = GRID_CONFIGS[size];
          const isSelected = selected === size;
          const label = config.label as 'grid3' | 'grid4' | 'grid6' | 'grid9';
          const descKey = `${label}Desc` as 'grid3Desc' | 'grid4Desc' | 'grid6Desc' | 'grid9Desc';

          return (
            <motion.button
              key={size}
              variants={cardVariants}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(size)}
              aria-pressed={isSelected}
              className={[
                'group relative flex flex-col items-center gap-3 rounded-xl p-4 md:p-5',
                'transition-all duration-200 cursor-pointer',
                'border-2 bg-white',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
                isSelected
                  ? 'border-terracotta shadow-[0_0_0_1px_var(--terracotta),0_4px_20px_rgba(196,101,58,0.15)]'
                  : 'border-light-gray hover:border-terracotta-light hover:shadow-md',
              ].join(' ')}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="grid-selection-indicator"
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-terracotta text-white"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
              )}

              <GridIcon size={size} isSelected={isSelected} />

              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-charcoal md:text-base">
                  {t(label)}
                </span>
                <span className="text-xs text-warm-gray leading-snug text-center">
                  {t(descKey)}
                </span>
              </div>

              <span
                className={[
                  'mt-auto rounded-full px-3 py-1 text-sm font-bold',
                  isSelected
                    ? 'bg-terracotta text-white'
                    : 'bg-cream text-teal',
                ].join(' ')}
              >
                {formatPrice(config.price)}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
