"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestFirebase() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Supabase test page
    router.push("/test-supabase");
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Redirecting to Supabase Test Page...
      </h1>
      <p>This project now uses Supabase instead of Firebase.</p>
    </div>
  );
}
