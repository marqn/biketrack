import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'pl', 'de', 'es', 'it'],
  defaultLocale: 'en'
});
