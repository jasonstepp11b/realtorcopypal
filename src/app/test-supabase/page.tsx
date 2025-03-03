"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import { supabase } from "@/lib/supabase/supabase";
import { getGenerations } from "@/lib/supabase/supabaseUtils";

export default function TestSupabase() {
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [generations, setGenerations] = useState<any[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setError("Please sign in with email/password to test Supabase");
      return;
    }

    const runTests = async () => {
      try {
        setTestResult("Running Supabase tests...");

        // Test 1: Check if profiles table exists and get current user profile
        try {
          setTestResult("Test 1: Checking if profiles table exists...");
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          setTestResult(`Test 1 Result: Profile found for user ${user.email}`);
        } catch (err) {
          setTestResult(
            `Test 1 Failed: ${err instanceof Error ? err.message : String(err)}`
          );
        }

        // Test 2: Check if generations table exists
        try {
          setTestResult("Test 2: Checking if generations table exists...");
          const { data, error } = await supabase
            .from("generations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;

          setGenerations(data || []);
          setTestResult(
            `Test 2 Result: Found ${data?.length || 0} generations for user`
          );
        } catch (err) {
          setTestResult(
            `Test 2 Failed: ${err instanceof Error ? err.message : String(err)}`
          );
        }

        // Test 3: Insert a test generation
        try {
          setTestResult("Test 3: Inserting a test generation...");
          const { data, error } = await supabase
            .from("generations")
            .insert([
              {
                user_id: user.id,
                content: "This is a test generation from the test page",
                type: "test",
                title: "Test Generation",
              },
            ])
            .select();

          if (error) throw error;

          setTestResult(
            `Test 3 Result: Successfully inserted test generation with ID ${data[0].id}`
          );

          // Refresh generations list
          const { data: updatedGenerations } = await supabase
            .from("generations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          setGenerations(updatedGenerations || []);
        } catch (err) {
          setTestResult(
            `Test 3 Failed: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      } catch (err) {
        setError(
          `Test failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    };

    runTests();
  }, [user, loading]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Test Page</h1>

      {testResult && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Test Result:</h2>
          <pre className="whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Generations:</h2>
        {generations.length === 0 ? (
          <p>No generations found</p>
        ) : (
          <div className="space-y-4">
            {generations.map((gen) => (
              <div key={gen.id} className="p-4 border rounded">
                <p className="font-medium">Title: {gen.title || "Untitled"}</p>
                <p className="text-sm text-gray-500">Type: {gen.type}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(gen.created_at).toLocaleString()}
                </p>
                <pre className="mt-2 text-sm overflow-auto max-h-40 bg-gray-50 p-2 rounded">
                  {gen.content}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
