import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const createServerClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerComponentClient({ cookies: () => cookieStore });
};

// Use this for API routes and server actions
export const createServerActionClientFromCookies = () => {
  return createServerActionClient({ cookies });
};
