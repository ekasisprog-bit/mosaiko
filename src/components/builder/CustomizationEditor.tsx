'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CATEGORY_REGISTRY, type CategoryType, type FloresTheme } from '@/lib/customization-types';

interface CustomizationEditorProps {
  category: CategoryType;
  values: Record<string, string>;
  onValueChange: (field: string, value: string) => void;
  selectedTheme: FloresTheme | null;
  onThemeChange: (theme: FloresTheme) => void;
  onComplete: () => void;
}

/** Maps internal field names to i18n keys */
const FIELD_I18N: Record<string, string> = {
  songName: 'fieldSongName',
  artistName: 'fieldArtistName',
  title: 'fieldTitle',
  artist: 'fieldArtist',
  year: 'fieldYear',
  studioText: 'fieldStudioText',
  japaneseText: 'fieldDecorativeText',
  customText: 'fieldCustomText',
  eventText: 'fieldEventText',
  date: 'fieldDate',
};

const THEME_SWATCHES: Record<FloresTheme, string> = {
  calido: '#E8A87C',
  fresco: '#7FB5D5',
  vintage: '#C9B99A',
  pastel: '#D4C5E2',
};

const THEME_ORDER: FloresTheme[] = ['calido', 'fresco', 'vintage', 'pastel'];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export function CustomizationEditor({
  category,
  values,
  onValueChange,
  selectedTheme,
  onThemeChange,
  onComplete,
}: CustomizationEditorProps) {
  const t = useTranslations('builder');
  const meta = CATEGORY_REGISTRY[category];

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-2xl font-bold text-charcoal md:text-3xl"
        >
          {t('customizeTitle')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-sm text-warm-gray md:text-base"
        >
          {t('customizeHint')}
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        {/* ─── Per-category field rendering ─── */}
        {category === 'spotify' && (
          <SpotifyFields values={values} onChange={onValueChange} />
        )}
        {category === 'arte' && (
          <ArteFields values={values} onChange={onValueChange} />
        )}
        {category === 'ghibli' && (
          <GhibliFields values={values} onChange={onValueChange} />
        )}
        {category === 'save-the-date' && (
          <SaveTheDateFields values={values} onChange={onValueChange} />
        )}
        {category === 'flores' && (
          <FloresThemeSelector
            selectedTheme={selectedTheme}
            onThemeChange={onThemeChange}
          />
        )}

        {/* ─── Continue button ─── */}
        <motion.div variants={itemVariants}>
          <button
            onClick={onComplete}
            className="min-h-[48px] w-full rounded-xl bg-btn-primary px-6 py-3 text-base font-semibold text-btn-text transition-colors hover:bg-btn-primary-hover cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-btn-primary"
          >
            {t('continue')}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
  type = 'text',
  hint,
}: {
  field: string;
  value: string;
  onChange: (field: string, value: string) => void;
  type?: 'text' | 'date';
  hint?: string;
}) {
  const t = useTranslations('builder');
  const label = t(FIELD_I18N[field] || field);

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
      <label htmlFor={`field-${field}`} className="text-sm font-medium text-charcoal">
        {label}
      </label>
      {hint && (
        <span className="text-xs text-warm-gray">{hint}</span>
      )}
      <input
        id={`field-${field}`}
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="min-h-[48px] rounded-lg border-2 border-light-gray bg-white px-4 py-3 text-sm text-charcoal transition-colors focus:border-terracotta focus:outline-none"
        placeholder={type === 'date' ? '' : label}
      />
    </motion.div>
  );
}

function SpotifyFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <>
      <FieldInput field="songName" value={values.songName || ''} onChange={onChange} />
      <FieldInput field="artistName" value={values.artistName || ''} onChange={onChange} />
    </>
  );
}

function ArteFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <>
      <FieldInput field="title" value={values.title || ''} onChange={onChange} />
      <FieldInput field="artist" value={values.artist || ''} onChange={onChange} />
      <FieldInput field="year" value={values.year || ''} onChange={onChange} />
    </>
  );
}

function GhibliFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  const t = useTranslations('builder');

  return (
    <>
      <FieldInput field="year" value={values.year || ''} onChange={onChange} />
      <FieldInput field="studioText" value={values.studioText || ''} onChange={onChange} hint="STUDIO GHIBLI" />
      <FieldInput
        field="japaneseText"
        value={values.japaneseText || ''}
        onChange={onChange}
        hint={t('fieldDecorativeTextHint')}
      />
      <FieldInput field="customText" value={values.customText || ''} onChange={onChange} />
    </>
  );
}

function SaveTheDateFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <>
      <FieldInput field="eventText" value={values.eventText || ''} onChange={onChange} />
      <FieldInput field="date" value={values.date || ''} onChange={onChange} type="date" />
    </>
  );
}

function FloresThemeSelector({
  selectedTheme,
  onThemeChange,
}: {
  selectedTheme: FloresTheme | null;
  onThemeChange: (theme: FloresTheme) => void;
}) {
  const t = useTranslations('builder');

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-2">
      <span className="text-sm font-medium text-charcoal">{t('themeLabel')}</span>
      <div className="grid grid-cols-2 gap-3">
        {THEME_ORDER.map((theme) => {
          const isActive = selectedTheme === theme;
          const themeKey = `theme${theme.charAt(0).toUpperCase()}${theme.slice(1)}` as
            | 'themeCalido'
            | 'themeFresco'
            | 'themeVintage'
            | 'themePastel';

          return (
            <button
              key={theme}
              onClick={() => onThemeChange(theme)}
              className={[
                'group relative flex items-center gap-3 rounded-lg border-2 p-3 transition-all cursor-pointer min-h-[48px]',
                isActive
                  ? 'border-terracotta bg-terracotta/5'
                  : 'border-light-gray bg-white hover:border-terracotta-light',
              ].join(' ')}
            >
              {/* Selection indicator */}
              {isActive && (
                <motion.div
                  layoutId="theme-selection-indicator"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-white"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
              )}

              <div
                className="h-8 w-8 shrink-0 rounded-full border-2 transition-colors"
                style={{
                  backgroundColor: THEME_SWATCHES[theme],
                  borderColor: isActive ? '#7b3f1e' : '#E5E5E5',
                }}
              />
              <span
                className={[
                  'text-sm font-medium',
                  isActive ? 'text-terracotta' : 'text-charcoal',
                ].join(' ')}
              >
                {t(themeKey)}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
