"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import { getProjects, PropertyProject } from "@/lib/supabase/supabaseUtils";
import {
  BuildingOffice2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

export default function RecentProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const MAX_PROJECTS = 5;

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects(user!.id);
      setProjects(data as PropertyProject[]);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mt-2">
      <div
        className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-300 cursor-pointer hover:text-white"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Recent Properties</span>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-1">
          {isLoading ? (
            <div className="px-4 py-2">
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                <div className="h-3 bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="px-4 py-2 text-xs text-gray-400">
              No properties yet
            </div>
          ) : (
            projects.slice(0, MAX_PROJECTS).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <BuildingOffice2Icon className="mr-2 h-4 w-4 text-gray-400" />
                <span className="truncate">{project.name}</span>
              </Link>
            ))
          )}

          <Link
            href="/projects/new"
            className="flex items-center px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 hover:text-blue-300"
          >
            + New Property
          </Link>

          {projects.length > 0 && (
            <Link
              href="/projects"
              className="flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-gray-300"
            >
              View all properties
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
