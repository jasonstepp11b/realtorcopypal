"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { user, loading, session, refreshSession } = useSupabaseAuth();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Function to check session and refresh if needed
  const checkSession = useCallback(async () => {
    console.log("Checking dashboard session status");
    if (!user && !loading) {
      console.log("No user and not loading, redirecting to login");
      router.push("/login");
      return false;
    }
    if (!session && user) {
      console.log("User exists but no session, refreshing...");
      await refreshSession();
    }
    return !!user;
  }, [user, loading, session, router, refreshSession]);

  // Handle initial load and visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        setIsPageVisible(true);
        console.log("Dashboard page visible, checking session...");
        const hasValidSession = await checkSession();
        if (hasValidSession) {
          setIsPageLoading(false);
        }
      } else {
        setIsPageVisible(false);
      }
    };

    // Initial session check
    const initialCheck = async () => {
      const hasValidSession = await checkSession();
      if (hasValidSession) {
        setIsPageLoading(false);
      }
    };

    initialCheck();

    // Set up visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkSession]);

  // Show loading state
  if (isPageLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Render dashboard only if user exists
  return user ? <Dashboard /> : null;
}
