import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

const SHOP_LINKS = [
  { href: '/catalogo' as const, key: 'catalog' },
  { href: '/personalizar' as const, key: 'customize' },
] as const;

const COMPANY_LINKS = [
  { href: '/nosotros' as const, key: 'about' },
  { href: '/preguntas-frecuentes' as const, key: 'faq' },
  { href: '/contacto' as const, key: 'contact' },
] as const;

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-teal text-cream">
      {/* Main Footer */}
      <div className="container-mosaiko py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1">
              <Image
                src="/logos/logo-white.png"
                alt="Mosaiko"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-xl font-bold text-cream font-brand tracking-tight">
                OSAIKO
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/70">
              {t('tagline')}
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              {t('shop')}
            </h3>
            <ul className="mt-4 space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/70 transition-colors hover:text-cream"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              {t('company')}
            </h3>
            <ul className="mt-4 space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/70 transition-colors hover:text-cream"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              {t('legal')}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <span className="text-sm text-cream/70">
                  {t('terms')}
                </span>
              </li>
              <li>
                <span className="text-sm text-cream/70">
                  {t('privacy')}
                </span>
              </li>
              <li>
                <span className="text-sm text-cream/70">
                  {t('cookies')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="container-mosaiko flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-cream/50">
            &copy; {currentYear} Mosaiko. {t('rights')}.
          </p>
          <p className="text-xs text-cream/50">
            {t('madeWith')}{' '}
            <span className="text-terracotta-light" aria-label="amor">
              &#9829;
            </span>{' '}
            {t('by')}{' '}
            <a
              href="https://outerhaven.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-cream/70 transition-colors hover:text-cream"
            >
              Outer Haven
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
