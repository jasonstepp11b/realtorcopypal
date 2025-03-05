"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { getProjects } from "@/lib/supabase/supabaseUtils";
import { PropertyProject } from "@/types/property";
import LoadingSpinner from "./ui/LoadingSpinner";
import { BuildingOffice2Icon, PlusIcon } from "@heroicons/react/24/outline";

const RecentProjects: React.FC = () => {
  const { user, session, refreshSession } = useSupabaseAuth();
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the fetch function
  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const data = await getProjects(user.id);
      setProjects(data as PropertyProject[]);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial data fetch
  useEffect(() => {
    if (user && session) {
      console.log("RecentProjects: Loading initial projects data");
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [user, session, fetchProjects]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && user) {
        console.log("RecentProjects: Tab visible, refreshing data");
        // Make sure we have a valid session
        await refreshSession();
        if (user && session) {
          fetchProjects();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, session, fetchProjects, refreshSession]);

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white shadow-sm rounded-lg px-6 py-8">
        <p className="text-center text-gray-600">
          Please sign in to view your recent projects.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
        <Link
          href="/projects/new"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No projects
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new property project
          </p>
          <div className="mt-6">
            <Link
              href="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {project.image_url && (
                <div className="relative h-40 w-full">
                  <Image
                    src={project.image_url}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <Link href={`/projects/${project.id}`}>
                  <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 truncate">
                    {project.name}
                  </h3>
                </Link>
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {project.address}
                </p>
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>{project.property_type}</span>
                  <span>${project.listing_price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentProjects;
