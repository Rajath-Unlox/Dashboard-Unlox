"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./Providers/AuthProvider";
import PageLoaderWrapper from "./PageLoaderWrapper";

interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRouteWrapper: React.FC<ProtectedRouteWrapperProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      if (user.role === "employee") {
        router.replace("/employee-dashboard");
      } else {
        router.replace("/");
      }
      return;
    }

    // ✅ Passed all checks
    setChecking(false);
  }, [loading, isAuthenticated, allowedRoles, user, router]);

  if (loading || checking) {
    return (
      <PageLoaderWrapper loading={true}>
        <div />
      </PageLoaderWrapper>
    );
  }

  return <>{children}</>;
};

export default ProtectedRouteWrapper;
