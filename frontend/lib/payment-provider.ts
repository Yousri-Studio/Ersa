export function getPaymentProviderIconName(provider: string): string {
  const key = (provider || '').toLowerCase();

  switch (key) {
    case 'clickpay':
      return 'credit-card';
    case 'hyperpay':
      return 'building-columns';
    case 'tamara':
      return 'wallet';
    case 'stripe':
      return 'cc-stripe';
    case 'paypal':
      return 'cc-paypal';
    case 'cash':
      return 'money-bill';
    case 'bank':
      return 'building-columns';
    default:
      return 'credit-card';
  }
}

