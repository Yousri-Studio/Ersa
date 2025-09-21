import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { ScrollAnimations } from '@/components/scroll-animations';
import { HtmlAttributes } from '@/components/layout/html-attributes';
import { cairo } from '../fonts';
import '../globals.css';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlAttributes />
      <Providers>
        <ScrollAnimations />
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </Providers>
    </NextIntlClientProvider>
  );
}