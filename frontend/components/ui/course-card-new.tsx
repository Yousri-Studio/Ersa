'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/ui/icon';
import { useTranslations, useLocale } from 'next-intl';
import { useHydration } from '@/lib/use-hydration';

// Types
type Localized = { ar: string; en: string };

export type CourseCardProps = {
  id: string;
  slug: string;
  title: Localized;
  summary: Localized;
  thumbnailUrl?: string;
  mode: 'onsite' | 'online';
  badge?: 'bestseller' | 'new' | null;
  durationLabel: Localized;
  rating?: number;
  category: 'Programming' | 'Business' | 'Design';
  instructorName?: string;

  price: number;
  currency: 'SAR' | 'USD';
  locale: 'ar' | 'en';
  inWishlist?: boolean;
  inCart?: boolean;
  onToggleWishlist?: (courseId: string) => void;
  onAddToCart?: (courseId: string) => void;
  onClick?: (slug: string) => void;
};

// Helper Components
const IconButton: React.FC<{
  kind: 'ghostCircle';
  active?: boolean;
  ariaLabel: string;
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  title?: string;
}> = ({ kind, active, ariaLabel, onClick, icon, title }) => {
  return (
    <button
      className={`
        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${active 
          ? 'bg-slate-50' 
          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
        }
      `}
      style={{
        ...(active ? { 
          color: '#00AC96',
          '--tw-ring-color': '#00AC96'
        } : {}),
        '--tw-ring-color': '#00AC96'
      } as React.CSSProperties}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title || ariaLabel}
    >
      {icon}
    </button>
  );
};



// Saudi Riyal Icon Component
const SaudiRiyalIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-6" }) => (
  <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g clipPath="url(#clip0_80_25819)">
      <path d="M12.4473 20.6257C12.0905 21.4171 11.8545 22.2758 11.7642 23.1764L19.3168 21.571C19.6737 20.7798 19.9094 19.9208 20 19.0202L12.4473 20.6257Z" fill="currentColor"/>
      <path d="M19.3168 16.7611C19.6737 15.9699 19.9096 15.1109 20 14.2103L14.1167 15.4616V13.0562L19.3166 11.9512C19.6735 11.16 19.9094 10.301 19.9998 9.40041L14.1166 10.6506V2.00009C13.2151 2.50626 12.4145 3.18002 11.7637 3.97476V11.1509L9.41075 11.651V0.823547C8.50926 1.32953 7.70865 2.00347 7.05784 2.79821V12.151L1.79319 13.2697C1.4363 14.0609 1.20021 14.9198 1.10965 15.8204L7.05784 14.5564V17.5855L0.683189 18.9402C0.326294 19.7313 0.0903802 20.5903 0 21.4909L6.67248 20.0729C7.21565 19.96 7.68249 19.6388 7.98602 19.1969L9.20971 17.3827V17.3823C9.33674 17.1946 9.41075 16.9683 9.41075 16.7246V14.0562L11.7637 13.5561V18.3669L19.3166 16.7607L19.3168 16.7611Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_80_25819">
        <rect width="20" height="22.3529" fill="white" transform="translate(0 0.823547)"/>
      </clipPath>
    </defs>
  </svg>
);

// Price formatting utility
const formatPrice = (price: number, currency: 'SAR' | 'USD', locale: 'ar' | 'en'): { text: string; showSaudiIcon: boolean } => {
  if (currency === 'SAR') {
    // Use regular numerals for both Arabic and English
    const formattedPrice = price.toLocaleString('en-US');
    return { text: formattedPrice, showSaudiIcon: true };
  } else {
    // USD format
    const formattedPrice = price.toLocaleString('en-US');
    return { text: `$${formattedPrice}`, showSaudiIcon: false };
  }
};

// Skeleton Component
const CourseCardSkeleton: React.FC = () => {
  return (
    <article className="group rounded-3xl border border-slate-100 bg-white shadow-sm animate-pulse flex flex-col h-full">
      <div className="p-4 pb-0">
        <div className="relative rounded-2xl bg-slate-100 p-2">
          <div className="h-48 w-full rounded-xl bg-slate-200" />
          <div className="absolute top-3 end-3 rounded-full bg-slate-200 h-8 w-20" />
        </div>
      </div>

      <div className="p-6 space-y-3 flex-grow flex flex-col">
        <div className="h-4 bg-slate-200 rounded w-24" />
        <div className="h-8 bg-slate-200 rounded w-3/4" />
        <div className="flex-grow">
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 pb-6 mt-auto">
        <div className="flex items-center gap-3">
          <div className="h-6 bg-slate-200 rounded w-16" />
          <div className="w-12 h-12 rounded-full bg-slate-200" />
          <div className="w-12 h-12 rounded-full bg-slate-200" />
        </div>
        <div className="h-8 bg-slate-200 rounded w-20" />
      </div>
    </article>
  );
};

// Main CourseCard Component
export const CourseCard: React.FC<CourseCardProps> & {
  Skeleton: React.FC;
} = ({
  id,
  slug,
  title,
  summary,
  thumbnailUrl,
  mode,
  badge,
  durationLabel,
  rating,
  category,
  instructorName,

  price,
  currency,
  locale,
  inWishlist = false,
  inCart = false,
  onToggleWishlist,
  onAddToCart,
  onClick
}) => {
  const t = useTranslations();
  const currentLocale = useLocale();
  const isHydrated = useHydration();

  const handleCardClick = () => {
    if (onClick) {
      onClick(slug);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  // Get mode label with hydration safety
  const getModeLabel = () => {
    if (!isHydrated) {
      return mode === 'onsite' ? 'حضوري' : 'أونلاين';
    }
    return mode === 'onsite' ? t('card.mode.onsite') : t('card.mode.online');
  };

  // Get mode icon
  const getModeIcon = () => {
    return mode === 'onsite' ? 'home' : 'desktop';
  };

  // Get bestseller label with hydration safety
  const getBestsellerLabel = () => {
    if (!isHydrated) {
      return 'الأكثر مبيعًا';
    }
    return t('card.badge.bestseller');
  };

  return (
    <article className="group rounded-3xl border border-slate-100 bg-white shadow-sm hover-lift card-animate flex flex-col h-full">
      <div className="p-4 pb-0">
        {/* Thumbnail frame with inner padding */}
        <div className="relative rounded-2xl bg-emerald-50/30 p-2">
          <div className="relative h-48 w-full rounded-xl overflow-hidden">
            <Image
              src={thumbnailUrl || "/images/Course Place Holder Small.png"}
              alt={isHydrated ? title[locale] : (title.ar || title.en)}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          
          {/* Mode badge (top-right) */}
          <div className={`absolute rounded-full text-white px-3 py-1 flex items-center gap-1.5 shadow-sm ${
            currentLocale === 'ar' ? 'right-5' : 'left-5'
          }`} style={{ backgroundColor: '#282660', top: '18px' }}>
            <Icon icon={getModeIcon()} className="w-3 h-3" />
            <span className="text-sm font-medium">{getModeLabel()}</span>
          </div>
        </div>
      </div>

      {/* Content area - flex-grow to push actions to bottom */}
      <div 
        className="p-6 space-y-3 cursor-pointer flex-grow flex flex-col" 
        onClick={handleCardClick}
      >
        {/* Top row with bestseller badge and category */}
        <div className="flex items-center justify-between">
          {/* Bestseller badge */}
          {badge === 'bestseller' && (
            <div className="text-sm flex items-center gap-1.5 font-medium" style={{ color: '#00AC96' }}>
              <span>🔥</span>
              <span>{getBestsellerLabel()}</span>
            </div>
          )}

          {/* Category tag */}
          <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ 
            backgroundColor: category === 'Programming' ? '#E1F3FF' : 
                           category === 'Business' ? '#FFE1E1' : 
                           '#E1FFE9',
            color: category === 'Programming' ? '#0078D4' : 
                  category === 'Business' ? '#D40000' : 
                  '#00D439'
          }}>
            {category}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-slate-900 line-clamp-1 font-cairo" style={{ fontWeight: 700, fontSize: '1.2rem' }}>
          {isHydrated ? title[locale as keyof Localized] : (title[currentLocale as keyof Localized] || title.ar || title.en)}
        </h3>

        {/* Summary and instructor */}
        <div className="flex-grow space-y-3">
          <p className="text-slate-500 line-clamp-2 leading-relaxed">
            {isHydrated ? summary[locale as keyof Localized] : (summary[currentLocale as keyof Localized] || summary.ar || summary.en)}
          </p>
          {instructorName && (
            <div className="flex items-center text-sm text-slate-600">
              <Icon icon="user" className="w-4 h-4 mr-2" />
              <span>{instructorName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions & price row - anchored to bottom */}
      <div className={`flex items-center justify-between px-6 pb-6 mt-auto ${
        currentLocale === 'ar' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Rating and Actions group */}
        <div className="flex items-center gap-3 order-1">
          {/* Rating chip - before the action buttons */}
          <div className="inline-flex items-center text-slate-600">
                            <Icon name="star" className="w-4 h-4 mr-1.5" style={{ color: '#FB831D' }} />
            <span className="text-sm font-medium">{rating?.toFixed(1) ?? '4.0'}</span>
          </div>

          {/* Action buttons group */}
          <div className="flex items-center gap-3">
            {/* Wishlist button */}
            <IconButton
              kind="ghostCircle"
              active={inWishlist}
              ariaLabel={isHydrated ? t('card.actions.wishlist') : 'Add to wishlist'}
              onClick={handleToggleWishlist}
              icon={
                <Icon 
                  icon={inWishlist ? ['fas', 'heart'] : ['far', 'heart']} 
                  className="w-5 h-5" 
                />
              }
            />

            {/* Add to cart button */}
            <IconButton
              kind="ghostCircle"
              ariaLabel={isHydrated ? t('card.actions.cart') : 'Add to cart'}
              onClick={handleAddToCart}
              icon={
                <Icon 
                  icon={inCart ? 'check' : 'shopping-cart'} 
                  className="w-5 h-5" 
                />
              }
            />
          </div>
        </div>

        {/* Price group */}
        <div className="flex items-center order-2">
          {/* Price */}
          <div className={`flex items-center gap-2 ${
            currentLocale === 'ar' ? 'flex-row-reverse' : 'flex-row'
          }`} style={{ 
            color: 'var(--Secondary, #00AC96)',
            textAlign: 'right',
            fontFamily: 'Cairo',
            fontSize: '22px',
            fontStyle: 'normal',
            fontWeight: '700'
          }}>
            {(() => {
              const priceData = formatPrice(price, currency, locale);
              return (
                <>
                  {priceData.showSaudiIcon && <SaudiRiyalIcon className="w-5 h-6 flex-shrink-0" />}
                  <span>{priceData.text}</span>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </article>
  );
};

// Attach skeleton to the main component
CourseCard.Skeleton = CourseCardSkeleton;

export default CourseCard;
