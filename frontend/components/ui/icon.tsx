import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faXmark, faUser, faHeart, faShoppingCart, faGraduationCap, faLanguage, faSearch, faFilter,
  faArrowRight, faArrowLeft, faChevronDown, faChevronUp, faChevronRight, faChevronLeft, faSort, faTag,
  faThLarge, faList, faSliders, faArrowsUpDown, faEllipsisV, faVideo, faBook, faClock, faUsers,
  faCalendar, faStar, faPlay, faDownload, faCertificate, faEye, faEyeSlash, faEnvelope, faPhone,
  faMobileScreen, faLock, faUserPlus, faSignInAlt, faSignOutAlt, faShieldAlt, faInfoCircle, faPowerOff,
  faPlus, faMinus, faTrash, faEdit, faCheck, faTimes, faSpinner, faExclamationTriangle, faCheckCircle,
  faTimesCircle, faChartLine, faTable, faFileText, faCog, faDatabase, faUpload, faFolder, faFile,
  faHome, faDesktop, faTshirt, faDollarSign, faUserShield, faLayerGroup, faCube, faExternalLinkAlt,
  faSave, faQuestionCircle, faCogs, faBriefcase, faRobot, faFileAlt, faPen, faMessage, faGlobe,
  faMagnifyingGlass, faCloudArrowUp, faPrint
} from '@fortawesome/free-solid-svg-icons';
import { 
  faHeart as faHeartRegular, faStar as faStarRegular, faBookmark as faBookmarkRegular,
  faUser as faUserRegular, faEnvelope as faEnvelopeRegular
} from '@fortawesome/free-regular-svg-icons';
import {
  faFacebook, faTwitter, faLinkedin, faInstagram, faYoutube, faWhatsapp, faGoogle
} from '@fortawesome/free-brands-svg-icons';

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
const iconMap: Record<string, any> = {
  // Navigation & UI
  'bars': faBars,
  'xmark': faXmark,
  'x': faXmark, // Alias for close button
  'user': faUser,
  'heart': faHeart,
  'shopping-cart': faShoppingCart,
  'graduation-cap': faGraduationCap,
  'language': faLanguage,
  'search': faSearch,
  'filter': faFilter,
  'arrow-right': faArrowRight,
  'arrow-left': faArrowLeft,
  'chevron-down': faChevronDown,
  'chevron-up': faChevronUp,
  'chevron-right': faChevronRight,
  'chevron-left': faChevronLeft,
  'sort': faSort,
  'tag': faTag,
  'th-large': faThLarge,
  'list': faList,
  'sliders': faSliders,
  'up-down': faArrowsUpDown,
  'ellipsis-v': faEllipsisV,
  
  // Course & Learning
  'video': faVideo,
  'book': faBook,
  'clock': faClock,
  'users': faUsers,
  'calendar': faCalendar,
  'star': faStar,
  'play': faPlay,
  'download': faDownload,
  'certificate': faCertificate,
  
  // Auth & Profile
  'eye': faEye,
  'eye-slash': faEyeSlash,
  'envelope': faEnvelope,
  'phone': faPhone,
  'mobile-screen': faMobileScreen,
  'lock': faLock,
  'user-plus': faUserPlus,
  'sign-in': faSignInAlt,
  'sign-out': faSignOutAlt,
  'shield-alt': faShieldAlt,
  'info-circle': faInfoCircle,
  'power-off': faPowerOff,
  
  // E-commerce
  'plus': faPlus,
  'minus': faMinus,
  'trash': faTrash,
  'edit': faEdit,
  'check': faCheck,
  'times': faTimes,
  'spinner': faSpinner,
  'exclamation-triangle': faExclamationTriangle,
  'check-circle': faCheckCircle,
  'times-circle': faTimesCircle,
  
  // Admin & Management
  'chart-line': faChartLine,
  'table': faTable,
  'file-text': faFileText,
  'cog': faCog,
  'database': faDatabase,
  'upload': faUpload,
  'folder': faFolder,
  'file': faFile,
  'home': faHome,
  'desktop': faDesktop,
  'shirt': faTshirt,
  'dollar-sign': faDollarSign,
  'user-shield': faUserShield,
  
  // Content Management
  'layer-group': faLayerGroup,
  'cube': faCube,
  'external-link-alt': faExternalLinkAlt,
  'save': faSave,
  'question-circle': faQuestionCircle,
  'cogs': faCogs,
  'briefcase': faBriefcase,
  'robot': faRobot,
  'file-alt': faFileAlt,
  
  // Regular icons (for outline style)
  'heart-regular': faHeartRegular,
  'star-regular': faStarRegular,
  'bookmark-regular': faBookmarkRegular,
  'user-regular': faUserRegular,
  'envelope-regular': faEnvelopeRegular,
  
  // Brand icons
  'facebook': faFacebook,
  'twitter': faTwitter,
  'linkedin': faLinkedin,
  'instagram': faInstagram,
  'youtube': faYoutube,
  'whatsapp': faWhatsapp,
  'google': faGoogle,
  
  // Additional icons that were being used
  'pen': faPen,
  'message': faMessage,
  'globe': faGlobe,
  'magnifying-glass': faMagnifyingGlass,
  'cloud-upload': faCloudArrowUp,
  'cloud-upload-alt': faCloudArrowUp,
  'printer': faPrint,
  'print': faPrint,
};

export function Icon({ name, icon, className = '', variant = 'solid', style, color, width }: IconProps) {
  let iconDefinition = null;
  
  // Handle both old API (icon prop) and new API (name prop)
  if (name && iconMap[name]) {
    iconDefinition = iconMap[name];
  } else if (icon) {
    // Legacy support for icon prop
    const iconName = Array.isArray(icon) ? icon[1] : icon;
    const cleanIconName = iconName.replace('fa-', '');
    iconDefinition = iconMap[cleanIconName];
  }
  
  if (!iconDefinition) {
    console.warn(`Icon not found: name="${name}", icon="${icon}"`);
    return <span className={className}>?</span>;
  }
  
  // Build inline styles
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
    <FontAwesomeIcon 
      icon={iconDefinition}
      className={className}
      style={{
        height: '1.5rem',
        width: '1.5rem',
        ...inlineStyles
      }}
    />
  );
}
