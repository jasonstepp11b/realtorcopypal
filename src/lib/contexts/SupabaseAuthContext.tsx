"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabase";
import {
  signUpWithEmail as supabaseSignUpWithEmail,
  signInWithEmailAndPassword as supabaseSignInWithEmail,
  resetPassword as supabaseResetPassword,
  updateUserPassword as supabaseUpdateUserPassword,
  getUserProfile,
  trackEvent,
  UserProfile,
} from "../supabase/supabaseUtils";
import { useRouter } from "next/navigation";
import { setCookie, destroyCookie } from "nookies";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user profile based on user id
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, []);

  // Session refresh function - called when tab becomes visible
  const refreshSession = useCallback(async () => {
    console.log("Manually refreshing session from context");
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        // Update the auth cookie
        setCookie(null, "supabase-auth", "true", {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
        // Fetch user profile if we have a user
        if (data.session.user.id) {
          await fetchUserProfile(data.session.user.id);
        }
        console.log("Session refreshed successfully");
      } else {
        setSession(null);
        setUser(null);
        setUserProfile(null);
        destroyCookie(null, "supabase-auth");
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      setSession(null);
      setUser(null);
      setUserProfile(null);
      destroyCookie(null, "supabase-auth");
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Listen for visibility changes to refresh session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleVisibilityChange = async () => {
        if (document.visibilityState === "visible") {
          console.log("Tab visible - checking auth session from context");
          await refreshSession();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, [refreshSession]);

  // Set the initial session and subscribe to auth changes
  useEffect(() => {
    setLoading(true);

    // Try to get the initial session and set the user
    const initializeAuth = async () => {
      try {
        // Get initial session (this gets from localStorage first)
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          setCookie(null, "supabase-auth", "true", {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
          });

          // Fetch user profile if we have a user
          if (initialSession.user.id) {
            await fetchUserProfile(initialSession.user.id);
          }

          // Track sign-in event
          trackEvent("user_signed_in", { method: "session_restored" });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up the auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);

      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        setCookie(null, "supabase-auth", "true", {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });

        // Fetch user profile if we have a user
        if (newSession.user?.id) {
          await fetchUserProfile(newSession.user.id);
        }

        // Track sign-in event
        if (event === "SIGNED_IN") {
          trackEvent("user_signed_in", { method: "auth_state_change" });
        }
      } else {
        setSession(null);
        setUser(null);
        setUserProfile(null);
        destroyCookie(null, "supabase-auth");

        if (event === "SIGNED_OUT") {
          trackEvent("user_signed_out");
        }
      }

      setLoading(false);
    });

    // Cleanup: unsubscribe on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, router]);

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      setLoading(true);
      await supabaseSignUpWithEmail(email, password, fullName);

      // Auth state listener will handle updating the user state
      trackEvent("user_signed_up", { method: "email" });
    } catch (error) {
      console.error("Error signing up with email", error);
      setLoading(false);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await supabaseSignInWithEmail(email, password);

      // Auth state listener will handle updating the user state
      trackEvent("user_signed_in", { method: "email" });
    } catch (error) {
      console.error("Error signing in with email", error);
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await supabaseResetPassword(email);
    } catch (error) {
      console.error("Error resetting password", error);
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      await supabaseUpdateUserPassword(password);
    } catch (error) {
      console.error("Error updating password", error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Track sign-out event
      trackEvent("user_signed_out");

      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      destroyCookie(null, "supabase-auth");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    signOut,
    refreshSession,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSupabaseAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider");
  }
  return context;
};
