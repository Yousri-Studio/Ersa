import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { ScrollAnimations } from '@/components/scroll-animations';
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
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="stylesheet" href="/fontawesome/css/all.min.css" />
        {/* Apple ID Sign In - Only load if client ID is configured */}
        {process.env.NEXT_PUBLIC_APPLE_CLIENT_ID && (
          <>
            <script 
              type="text/javascript" 
              src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
              async
            />
            <meta name="appleid-signin-client-id" content={process.env.NEXT_PUBLIC_APPLE_CLIENT_ID} />
            <meta name="appleid-signin-scope" content="name email" />
            <meta name="appleid-signin-redirect-uri" content={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/success`} />
            <meta name="appleid-signin-state" content="origin:web" />
          </>
        )}
      </head>
      <body className={`${cairo.variable} font-cairo`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <ScrollAnimations />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}