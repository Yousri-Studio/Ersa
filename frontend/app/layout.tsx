import type { Metadata } from 'next';
import './globals.css';
import { cairo } from './fonts';

export const metadata: Metadata = {
  title: 'Ersa Training',
  description: 'Professional development courses designed to elevate your career and unlock your potential',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W78GL4RP');`,
          }}
        />
        {/* End Google Tag Manager */}
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
      <body className={`${cairo.variable} font-cairo`} suppressHydrationWarning={true}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W78GL4RP"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  );
}
