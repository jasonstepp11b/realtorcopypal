/**
 * CORS headers for Supabase requests
 * These headers are needed when accessing Supabase resources from the browser
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
