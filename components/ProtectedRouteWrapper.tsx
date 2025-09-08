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

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, show loading (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRouteWrapper;