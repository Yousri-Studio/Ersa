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
    <html>
      <head>
        <link rel="stylesheet" href="/fontawesome/css/all.min.css" />
      </head>
      <body className={`${cairo.variable} font-cairo`}>
        {children}
      </body>
    </html>
  );
}
