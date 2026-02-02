import { useEffect, useState } from 'react';
import { paymentsApi, type PaymentConfig } from '@/lib/api';

export function usePaymentConfig(isEnabled = true) {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEnabled) return;

    let isMounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await paymentsApi.getConfig();
        if (!isMounted) return;
        setConfig(res.data);
      } catch (e: unknown) {
        if (!isMounted) return;
        setError('Failed to load payment configuration');
        setConfig(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [isEnabled]);

  return { config, isLoading, error };
}

