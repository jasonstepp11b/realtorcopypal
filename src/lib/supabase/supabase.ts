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
  },
});

// Add visibility change handler to reconnect Supabase when tab becomes visible
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // Force a refresh of the auth state when the tab becomes visible
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          console.log(
            "Refreshing Supabase connection on tab visibility change"
          );
          // This will trigger a refresh of the session
          supabase.auth.refreshSession();
        }
      });
    }
  });
}
