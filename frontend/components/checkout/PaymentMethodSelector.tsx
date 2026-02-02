'use client';

import { useMemo } from 'react';
import { Icon } from '@/components/ui/icon';
import { getPaymentProviderIconName } from '@/lib/payment-provider';

type Props = {
  title: string;
  availableGateways: string[];
  selectedGateway: string | null;
  onChange: (gateway: string) => void;
};

function normalizeGatewayLabel(gateway: string) {
  return gateway;
}

export default function PaymentMethodSelector({
  title,
  availableGateways,
  selectedGateway,
  onChange,
}: Props) {
  const options = useMemo(
    () => availableGateways.filter(Boolean),
    [availableGateways],
  );

  if (options.length <= 1) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold mb-3 font-cairo">{title}</h3>

      <div className="space-y-3">
        {options.map((gateway) => {
          const isSelected =
            !!selectedGateway &&
            gateway.toLowerCase() === selectedGateway.toLowerCase();

          return (
            <button
              key={gateway}
              type="button"
              onClick={() => onChange(gateway)}
              className={[
                'w-full flex items-center justify-between rounded-lg border p-4 text-left transition-colors',
                isSelected
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <Icon
                  name={getPaymentProviderIconName(gateway)}
                  className={[
                    'h-5 w-5',
                    isSelected ? 'text-teal-700' : 'text-gray-500',
                  ].join(' ')}
                />
                <span className="font-cairo font-medium text-gray-900">
                  {normalizeGatewayLabel(gateway)}
                </span>
              </div>

              <span
                className={[
                  'inline-flex h-5 w-5 items-center justify-center rounded-full border',
                  isSelected
                    ? 'border-teal-600 bg-teal-600'
                    : 'border-gray-300 bg-white',
                ].join(' ')}
                aria-hidden
              >
                {isSelected && (
                  <Icon name="check" className="h-3 w-3 text-white" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

