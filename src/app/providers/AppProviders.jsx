import React from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '@/context/AuthContext';

export function AppProviders({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}
