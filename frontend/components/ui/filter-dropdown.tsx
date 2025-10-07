'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Icon } from '@/components/ui/icon';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  icon?: string;
  iconStyle?: 'solid' | 'regular';
}

export function FilterDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder,
  label,
  icon = "filter",
  iconStyle = "solid"
}: FilterDropdownProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" style={{ 
      zIndex: 9999,
      position: 'relative',
      isolation: 'isolate'
    }}>
      {/* Label */}
      {label && (
        <label 
          className={`block text-gray-700 mb-2 font-cairo ${locale === 'ar' ? 'text-right' : 'text-left'}`}
          style={{ fontSize: '12px', fontWeight: 700 }}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          {label}
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-3 px-4
          focus:outline-none font-cairo
          ${locale === 'ar' ? 'text-right' : 'text-left'}
          ${selectedOption ? 'filter-dropdown-selected' : 'filter-dropdown-button'}
        `}
        style={{
          borderRadius: '6px',
          height: '52px',
          width: '100%'
        }}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Icon and Text Group */}
        <div className="flex items-center gap-3">
          <Icon 
          	icon={[iconStyle === 'regular' ? 'far' : 'fas', icon] as any} 
            className="flex-shrink-0"
            style={{ 
              color: selectedOption ? '#00AC96' : '#292561',
              height: '1.0rem',
              width: '1.0rem'
            }}
          />
          <span 
            className="font-cairo"
            style={{ 
              fontSize: selectedOption ? '14px' : '10px', 
              fontWeight: selectedOption ? 600 : 500,
              color: selectedOption ? '#00AC96' : '#6B7280'
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        
        {/* Chevron Arrow */}
        <Icon 
          name="chevron-down" 
          className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ height: '1.0rem', width: '1.0rem' }}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0" 
            style={{ zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className={`
              filter-dropdown-menu absolute w-full mt-2
              ${locale === 'ar' ? 'right-0' : 'left-0'}
            `}
            style={{
              borderRadius: '6px',
              zIndex: 10000,
              background: '#FFFFFF',
              border: '1px solid #EBEBF0',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              position: 'absolute',
              top: '100%',
              left: locale === 'ar' ? 'auto' : '0',
              right: locale === 'ar' ? '0' : 'auto'
            }}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  filter-dropdown-option w-full px-6 py-3 font-cairo
                  ${value === option.value ? 'selected' : 'text-gray-700'}
                  ${locale === 'ar' ? 'text-right' : 'text-left'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
