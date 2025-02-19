import React, { useEffect, useState } from 'react';
import { authService } from '@/services/AuthService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!await authService.isAuthorized()) {
          await authService.registerDevice();
        }
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth error:', error);
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <div>Unauthorized device</div>;
  }

  return <>{children}</>;
}; 