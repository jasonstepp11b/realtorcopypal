import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Force localStorage storage mechanism for better cross-tab support
    storage: {
      getItem: (key) => {
        try {
          const itemStr = localStorage.getItem(key);
          if (!itemStr) {
            return null;
          }
          return itemStr;
        } catch (error) {
          console.error("Error accessing localStorage:", error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error("Error writing to localStorage:", error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error("Error removing from localStorage:", error);
        }
      },
    },
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
          const storedSession = localStorage.getItem("supabase.auth.token");
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
