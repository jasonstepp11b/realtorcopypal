import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create a custom storage object that checks for browser environment
const customStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const itemStr = localStorage.getItem(key);
      return itemStr;
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Use our custom storage implementation that handles SSR
    storage: customStorage,
    // Detect and handle inactive tabs better
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    // Retry failed requests to improve reliability
    fetch: (...args) => fetch(...args),
  },
});

// Add visibility change handler to reconnect Supabase when tab becomes visible
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.log("Tab became visible, refreshing Supabase session...");
      // Force a refresh of the auth state when the tab becomes visible
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          console.log("Session found, refreshing auth tokens");
          // This will trigger a refresh of the session
          supabase.auth.refreshSession();
        } else {
          console.log("No session found on visibility change");
          // Try to recover the session from localStorage if possible
          const storedSession = customStorage.getItem("supabase.auth.token");
          if (storedSession) {
            console.log("Found stored session, attempting to recover");
            // Force the client to recheck auth storage
            supabase.auth.getSession();
          }
        }
      });
    }
  });
}
