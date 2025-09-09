"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './Providers/AuthProvider';
import PageLoaderWrapper from './PageLoaderWrapper';

interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
}

const ProtectedRouteWrapper: React.FC<ProtectedRouteWrapperProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Set a cookie flag to indicate tokens might exist in localStorage
    // This helps the middleware make better decisions
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken || refreshToken) {
      document.cookie = 'hasTokens=true; path=/';
    } else {
      document.cookie = 'hasTokens=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while checking authentication or redirecting
  if (loading || !isAuthenticated) {
    return <PageLoaderWrapper loading={true}><div /></PageLoaderWrapper>;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRouteWrapper;