'use client';

import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

interface HtmlContentProps {
  html: string;
  className?: string;
}

export function HtmlContent({ html, className = '' }: HtmlContentProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    // Only run DOMPurify on the client side
    if (typeof window !== 'undefined') {
      const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'blockquote', 'hr',
          'a', 'span', 'div'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
      });
      setSanitizedHtml(clean);
    }
  }, [html]);

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

