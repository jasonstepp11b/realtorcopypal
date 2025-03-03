"use client";

import React, { createContext, useEffect, useState } from "react";
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
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userProfile: null,
  loading: false,
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set initial session from local storage
    const initialSession = supabase.auth.getSession();
    initialSession.then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Set auth cookie
        Cookies.set("auth_token", "true", { expires: 7, sameSite: "strict" });

        // Fetch user profile
        getUserProfile(session.user.id).then((profile) => {
          setUserProfile(profile);
        });

        // Track sign-in event
        trackEvent("user_signed_in", { method: "session_restored" });
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Set auth cookie
        Cookies.set("auth_token", "true", { expires: 7, sameSite: "strict" });

        // Fetch user profile
        const profile = await getUserProfile(session.user.id);
        setUserProfile(profile);

        if (event === "SIGNED_IN") {
          trackEvent("user_signed_in", { method: "auth_state_change" });
        }
      } else {
        // Remove auth cookie
        Cookies.remove("auth_token");
        setUserProfile(null);

        if (event === "SIGNED_OUT") {
          trackEvent("user_signed_out");
        }
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const signOut = async () => {
    try {
      setLoading(true);

      // Track sign-out event
      trackEvent("user_signed_out");

      // Remove auth cookie
      Cookies.remove("auth_token");

      await supabase.auth.signOut();
      // Auth state listener will handle updating the user state
    } catch (error) {
      console.error("Error signing out", error);
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        loading,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
