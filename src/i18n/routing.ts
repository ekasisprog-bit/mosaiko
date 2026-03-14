import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/personalizar': {
      es: '/personalizar',
      en: '/customize',
    },
    '/carrito': {
      es: '/carrito',
      en: '/cart',
    },
    '/catalogo': {
      es: '/catalogo',
      en: '/catalog',
    },
    '/nosotros': {
      es: '/nosotros',
      en: '/about',
    },
    '/preguntas-frecuentes': {
      es: '/preguntas-frecuentes',
      en: '/faq',
    },
    '/contacto': {
      es: '/contacto',
      en: '/contact',
    },
    '/terminos': {
      es: '/terminos',
      en: '/terms',
    },
    '/privacidad': {
      es: '/privacidad',
      en: '/privacy',
    },
    '/politica-cookies': {
      es: '/politica-cookies',
      en: '/cookie-policy',
    },
    '/pedido-confirmado': {
      es: '/pedido-confirmado',
      en: '/order-confirmed',
    },
  },
});
