"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestFirebase() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to test-supabase page
    router.push("/test-supabase");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Redirecting to Supabase Test Page...
        </h1>
        <p>The application now uses Supabase instead of Firebase.</p>
      </div>
    </div>
  );
}
