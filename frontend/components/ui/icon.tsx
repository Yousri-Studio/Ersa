import React from 'react';

interface IconProps {
  name?: string;
  icon?: string | string[];
  className?: string;
  variant?: 'solid' | 'regular' | 'light' | 'thin' | 'duotone' | 'brands';
  style?: React.CSSProperties;
  color?: string;
  width?: string;
}

// FontAwesome icon mapping
const iconMap: Record<string, string> = {
  // Navigation & UI
  'bars': 'fa-bars',
  'xmark': 'fa-xmark',
  'user': 'fa-user',
  'heart': 'fa-heart',
  'shopping-cart': 'fa-shopping-cart',
  'graduation-cap': 'fa-graduation-cap',
  'language': 'fa-language',
  'search': 'fa-search',
  'filter': 'fa-filter',
  'arrow-right': 'fa-arrow-right',
  'arrow-left': 'fa-arrow-left',
  'chevron-down': 'fa-chevron-down',
  'chevron-up': 'fa-chevron-up',
  'chevron-right': 'fa-chevron-right',
  'chevron-left': 'fa-chevron-left',
  'sort': 'fa-sort',
  'tag': 'fa-tag',
  'th-large': 'fa-th-large',
  'list': 'fa-list',
  'sliders': 'fa-sliders',
  'up-down': 'fa-arrows-up-down',
  'ellipsis-v': 'fa-ellipsis-v',
  
  // Course & Learning
  'video': 'fa-video',
  'book': 'fa-book',
  'clock': 'fa-clock',
  'users': 'fa-users',
  'calendar': 'fa-calendar',
  'star': 'fa-star',
  'play': 'fa-play',
  'download': 'fa-download',
  'certificate': 'fa-certificate',
  
  // Auth & Profile
  'eye': 'fa-eye',
  'eye-slash': 'fa-eye-slash',
  'envelope': 'fa-envelope',
  'phone': 'fa-phone',
  'mobile-screen': 'fa-mobile-screen',
  'lock': 'fa-lock',
  'user-plus': 'fa-user-plus',
  'sign-in': 'fa-sign-in-alt',
  'sign-out': 'fa-sign-out-alt',
  'shield-alt': 'fa-shield-alt',
  'info-circle': 'fa-info-circle',
  'power-off': 'fa-power-off',
  
  // E-commerce
  'plus': 'fa-plus',
  'minus': 'fa-minus',
  'trash': 'fa-trash',
  'edit': 'fa-edit',
  'check': 'fa-check',
  'times': 'fa-times',
  'spinner': 'fa-spinner',
  'exclamation-triangle': 'fa-exclamation-triangle',
  'check-circle': 'fa-check-circle',
  'times-circle': 'fa-times-circle',
  
  // Admin & Management
  'chart-line': 'fa-chart-line',
  'table': 'fa-table',
  'file-text': 'fa-file-text',
  'cog': 'fa-cog',
  'database': 'fa-database',
  'upload': 'fa-upload',
  'folder': 'fa-folder',
  'file': 'fa-file',
  'home': 'fa-home',
  'desktop': 'fa-desktop',
  'shirt': 'fa-tshirt',
  'dollar-sign': 'fa-dollar-sign',
  'user-shield': 'fa-user-shield',
  
  // Content Management
  'layer-group': 'fa-layer-group',
  'cube': 'fa-cube',
  'external-link-alt': 'fa-external-link-alt',
  'save': 'fa-save',
  'question-circle': 'fa-question-circle',
  'cogs': 'fa-cogs',
  'briefcase': 'fa-briefcase',
  'robot': 'fa-robot',
  'file-alt': 'fa-file-alt',
  
  // Regular icons (for outline style)
  'heart-regular': 'fa-heart',
  'star-regular': 'fa-star',
  'bookmark-regular': 'fa-bookmark',
  'user-regular': 'fa-user',
  'envelope-regular': 'fa-envelope',
  
  // Brand icons
  'facebook': 'fa-facebook',
  'twitter': 'fa-twitter',
  'linkedin': 'fa-linkedin',
  'instagram': 'fa-instagram',
  'youtube': 'fa-youtube',
  'whatsapp': 'fa-whatsapp',
  'google': 'fa-google',
  
  // Additional icons that were being used
  'pen': 'fa-pen',
  'message': 'fa-message',
  'globe': 'fa-globe',
  'magnifying-glass': 'fa-magnifying-glass',
};

export function Icon({ name, icon, className = '', variant = 'solid', style, color, width }: IconProps) {
  let iconClass = '';
  let faStyle = variant;
  
  // Handle both old API (icon prop) and new API (name prop)
  if (icon) {
    if (Array.isArray(icon)) {
      // Handle array format: ['fas', 'fa-heart'] or ['far', 'heart']
      if (icon.length >= 2) {
        faStyle = icon[0] as any;
        iconClass = icon[1].startsWith('fa-') ? icon[1] : `fa-${icon[1]}`;
      }
    } else {
      // Handle string format: 'fa-heart' or 'heart'
      iconClass = icon.startsWith('fa-') ? icon : `fa-${icon}`;
    }
  } else if (name) {
    // New API with name prop
    iconClass = iconMap[name];
  }
  
  if (!iconClass) {
    console.warn(`Icon not found: name="${name}", icon="${icon}"`);
    return <span className={className}>?</span>;
  }
  
  // Determine the appropriate FontAwesome class prefix
  let faClass = '';
  switch (faStyle) {
    case 'solid':
      faClass = `fas ${iconClass}`;
      break;
    case 'regular':
      faClass = `far ${iconClass}`;
      break;
    case 'light':
      faClass = `fal ${iconClass}`;
      break;
    case 'thin':
      faClass = `fa-thin ${iconClass}`;
      break;
    case 'duotone':
      faClass = `fad ${iconClass}`;
      break;
    case 'brands':
      faClass = `fab ${iconClass}`;
      break;
    default:
      faClass = `fas ${iconClass}`;
  }
  
  // Build inline styles - handle both CSS style object and FontAwesome style string
  const inlineStyles: React.CSSProperties = {};
  
  // If style is a CSS object, use it
  if (style && typeof style === 'object') {
    Object.assign(inlineStyles, style);
  }
  
  // Apply color and width props
  if (color) {
    inlineStyles.color = color;
  }
  if (width) {
    inlineStyles.width = width;
  }
  
  return (
    <i 
      className={`${faClass} ${className}`} 
      aria-hidden="true"
      style={{
        height: '1.5rem',
        width: '1.5rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...inlineStyles
      }}
    ></i>
  );
}
