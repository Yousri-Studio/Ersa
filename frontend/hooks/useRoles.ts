import { useState, useEffect } from 'react';
import { getUserRolesFromStorage, isSuperAdmin, isAdmin, isOperation, UserRole } from '@/lib/roles';

export function useRoles() {
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRoles = () => {
      const userRoles = getUserRolesFromStorage();
      console.log('useRoles: Loaded roles from storage:', userRoles);
      setRoles(userRoles);
      setIsLoading(false);
    };

    loadRoles();

    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      loadRoles();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom auth events
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  return {
    roles,
    isLoading,
    isSuperAdmin: isSuperAdmin(roles),
    isAdmin: isAdmin(roles),
    isOperation: isOperation(roles),
    hasRole: (role: UserRole) => roles.includes(role),
    hasAnyRole: (checkRoles: UserRole[]) => checkRoles.some(role => roles.includes(role)),
    hasAllRoles: (checkRoles: UserRole[]) => checkRoles.every(role => roles.includes(role)),
  };
}

