/**
 * Utility functions for safely handling LocalizedText objects
 * Prevents "Objects are not valid as a React child" errors
 */

export type LocalizedText = {
  ar: string;
  en: string;
};

/**
 * Safely extracts a localized string from a LocalizedText object or string
 * @param text - The text that might be a LocalizedText object or a string
 * @param locale - The current locale ('ar' or 'en')
 * @param fallback - Fallback text if extraction fails
 * @returns The localized string
 */
export function getLocalizedText(
  text: LocalizedText | string | undefined | null,
  locale: 'ar' | 'en',
  fallback: string = ''
): string {
  // Handle null/undefined
  if (!text) {
    return fallback;
  }

  // If it's already a string, return it
  if (typeof text === 'string') {
    return text;
  }

  // If it's an object with ar/en properties
  if (typeof text === 'object' && ('ar' in text || 'en' in text)) {
    const localizedValue = text[locale];
    if (typeof localizedValue === 'string') {
      return localizedValue;
    }
    
    // Try the other locale as fallback
    const otherLocale = locale === 'ar' ? 'en' : 'ar';
    const otherValue = text[otherLocale];
    if (typeof otherValue === 'string') {
      return otherValue;
    }
  }

  // Last resort - return fallback
  console.warn('Could not extract localized text from:', text);
  return fallback;
}

/**
 * Creates a LocalizedText object from ar and en strings
 */
export function createLocalizedText(ar: string, en: string): LocalizedText {
  return { ar, en };
}

/**
 * Checks if a value is a LocalizedText object
 */
export function isLocalizedText(value: any): value is LocalizedText {
  return (
    value !== null &&
    typeof value === 'object' &&
    'ar' in value &&
    'en' in value &&
    typeof value.ar === 'string' &&
    typeof value.en === 'string'
  );
}

