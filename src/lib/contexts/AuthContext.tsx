"use client";

import React, { createContext, useEffect, useState } from "react";
import { User, Auth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signUpWithEmail as firebaseSignUpWithEmail,
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  resetPassword as firebaseResetPassword,
  resendVerificationEmail as firebaseResendVerificationEmail,
  isEmailVerified as firebaseIsEmailVerified,
  logoutUser,
  getUserProfile,
  trackEvent,
} from "../firebase/firebaseUtils";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  isEmailVerified: () => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: false,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  resetPassword: async () => {},
  resendVerificationEmail: async () => {},
  isEmailVerified: () => false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setUser(user);

      // Set or remove auth cookie for middleware
      if (user) {
        // Set a cookie that expires in 7 days
        Cookies.set("auth_token", "true", { expires: 7, sameSite: "strict" });

        // Track sign-in event
        trackEvent("user_signed_in", { method: "session_restored" });

        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        // Remove the auth cookie
        Cookies.remove("auth_token");
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const user = await firebaseSignInWithGoogle();

      // Set auth cookie
      Cookies.set("auth_token", "true", { expires: 7, sameSite: "strict" });

      // Track sign-in event
      trackEvent("user_signed_in", { method: "google" });

      // Auth state listener will handle updating the user state
    } catch (error) {
      console.error("Error signing in with Google", error);
      setLoading(false);
      throw error;
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      setLoading(true);
      const user = await firebaseSignUpWithEmail(email, password, displayName);

      // Set auth cookie
      Cookies.set("auth_token", "true", { expires: 7, sameSite: "strict" });

      // Track sign-up event
      trackEvent("user_signed_up", { method: "email" });

      // Auth state listener will handle updating the user state
    } catch (error) {
      console.error("Error signing up with email", error);
      setLoading(false);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await firebaseSignInWithEmail(email, password);

      // Set auth cookie
      Cookies.set("auth_token", "true", { expires: 7, sameSite: "strict" });

      // Track sign-in event
      trackEvent("user_signed_in", { method: "email" });

      // Auth state listener will handle updating the user state
    } catch (error) {
      console.error("Error signing in with email", error);
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await firebaseResetPassword(email);
    } catch (error) {
      console.error("Error resetting password", error);
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) {
      throw new Error("No user is currently signed in");
    }

    try {
      await firebaseResendVerificationEmail(user);
    } catch (error) {
      console.error("Error resending verification email", error);
      throw error;
    }
  };

  const isEmailVerified = () => {
    return firebaseIsEmailVerified(user);
  };

  const signOutUser = async () => {
    try {
      setLoading(true);

      // Track sign-out event
      trackEvent("user_signed_out");

      // Remove auth cookie
      Cookies.remove("auth_token");

      await logoutUser();
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
        userProfile,
        loading,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        resendVerificationEmail,
        isEmailVerified,
        signOut: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
