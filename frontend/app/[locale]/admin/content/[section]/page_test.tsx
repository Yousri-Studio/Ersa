'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function ContentEditor() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="p-8">
      <h1>Content Editor Test</h1>
      <p>Section: {params?.section}</p>
      <p>Locale: {locale}</p>
    </div>
  );
}
