"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import Link from "next/link";
import { supabase } from "@/lib/supabase/supabase";

export default function UsageStats() {
  const { user } = useAuth();
  const [usageStats, setUsageStats] = useState<{
    canGenerate: boolean;
    currentUsage: number;
    limit: number;
    percentUsed: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageStats = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get the count of generations for this user
        const { count, error: countError } = await supabase
          .from("generations")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (countError) throw countError;

        // Get the user's subscription plan from their profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("subscription_plan")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        // Determine the limit based on the subscription plan
        // Default to free plan if not specified
        const plan = profile?.subscription_plan || "free";

        let limit = 5; // Free plan
        if (plan === "starter") limit = 50;
        else if (plan === "professional") limit = 200;
        else if (plan === "team") limit = 500;

        const currentUsage = count || 0;
        const percentUsed = Math.min(
          Math.round((currentUsage / limit) * 100),
          100
        );
        const canGenerate = currentUsage < limit;

        setUsageStats({
          canGenerate,
          currentUsage,
          limit,
          percentUsed,
        });
      } catch (error) {
        console.error("Error fetching usage stats:", error);
        setError("Failed to load usage statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageStats();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error || !usageStats) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-red-500 text-sm">
          {error || "Unable to load usage statistics"}
        </p>
      </div>
    );
  }

  const { canGenerate, currentUsage, limit, percentUsed } = usageStats;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Usage Statistics
      </h3>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Generations Used</span>
          <span>
            {currentUsage} / {limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              percentUsed < 70
                ? "bg-green-600"
                : percentUsed < 90
                ? "bg-yellow-400"
                : "bg-red-600"
            }`}
            style={{ width: `${percentUsed}%` }}
          ></div>
        </div>
      </div>

      {!canGenerate && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          You&apos;ve reached your generation limit for this month.
          <Link
            href="/pricing"
            className="block mt-1 font-medium text-red-700 hover:text-red-800"
          >
            Upgrade your plan →
          </Link>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>
          Your current plan:{" "}
          <span className="font-medium text-gray-700">
            {usageStats.limit === 5
              ? "Free"
              : usageStats.limit === 50
              ? "Starter"
              : usageStats.limit === 200
              ? "Professional"
              : "Team"}
          </span>
        </p>
        <Link
          href="/pricing"
          className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-block mt-2"
        >
          View Plans
        </Link>
      </div>
    </div>
  );
}
