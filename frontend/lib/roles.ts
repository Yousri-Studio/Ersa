// Role management utilities for frontend

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Operation = 'Operation',
  PublicUser = 'PublicUser'
}

export interface UserWithRoles {
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

export interface RoleInfo {
  id: string;
  name: string;
  normalizedName: string;
}

// Helper functions to check user roles
export function hasRole(userRoles: string[], role: UserRole): boolean {
  return userRoles.includes(role);
}

export function hasAnyRole(userRoles: string[], roles: UserRole[]): boolean {
  return roles.some(role => userRoles.includes(role));
}

export function hasAllRoles(userRoles: string[], roles: UserRole[]): boolean {
  return roles.every(role => userRoles.includes(role));
}

export function isSuperAdmin(userRoles: string[]): boolean {
  return hasRole(userRoles, UserRole.SuperAdmin);
}

export function isAdmin(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, [UserRole.Admin, UserRole.SuperAdmin]);
}

export function isOperation(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, [UserRole.Operation, UserRole.Admin, UserRole.SuperAdmin]);
}

export function isPublicUser(userRoles: string[]): boolean {
  return hasRole(userRoles, UserRole.PublicUser);
}

// Get role display name
export function getRoleDisplayName(role: string, locale: string = 'en'): string {
  const roleNames: Record<string, Record<string, string>> = {
    SuperAdmin: {
      en: 'Super Administrator',
      ar: 'مدير النظام الأساسي'
    },
    Admin: {
      en: 'Administrator',
      ar: 'مدير النظام'
    },
    Operation: {
      en: 'Operations Manager',
      ar: 'مدير العمليات'
    },
    PublicUser: {
      en: 'User',
      ar: 'مستخدم'
    }
  };

  return roleNames[role]?.[locale] || role;
}

// Get role description
export function getRoleDescription(role: string, locale: string = 'en'): string {
  const roleDescriptions: Record<string, Record<string, string>> = {
    SuperAdmin: {
      en: 'Full system access with user role management',
      ar: 'الوصول الكامل للنظام مع إدارة أدوار المستخدمين'
    },
    Admin: {
      en: 'Administrative access for content and user management',
      ar: 'وصول إداري لإدارة المحتوى والمستخدمين'
    },
    Operation: {
      en: 'Operational access for course and content management',
      ar: 'وصول تشغيلي لإدارة الدورات والمحتوى'
    },
    PublicUser: {
      en: 'Standard user access for public features',
      ar: 'وصول المستخدم القياسي للميزات العامة'
    }
  };

  return roleDescriptions[role]?.[locale] || '';
}

// Get role color for UI badges
export function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    SuperAdmin: 'bg-purple-100 text-purple-800 border-purple-200',
    Admin: 'bg-blue-100 text-blue-800 border-blue-200',
    Operation: 'bg-green-100 text-green-800 border-green-200',
    PublicUser: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// Parse JWT to extract roles
export function extractRolesFromToken(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    console.log('JWT payload roles:', roles);
    
    if (Array.isArray(roles)) {
      return roles;
    } else if (typeof roles === 'string') {
      return [roles];
    }
    
    return [];
  } catch (error) {
    console.error('Error extracting roles from token:', error);
    return [];
  }
}

// Get user roles from localStorage
export function getUserRolesFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  
  const token = localStorage.getItem('token');
  if (!token) return [];
  
  return extractRolesFromToken(token);
}

