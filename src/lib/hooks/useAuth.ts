import { useSupabaseAuth } from "./useSupabaseAuth";

// This is a compatibility hook for backward compatibility with old code
// that still uses useAuth instead of useSupabaseAuth
export const useAuth = useSupabaseAuth;
