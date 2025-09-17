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
        {children}
      </body>
    </html>
  );
}
