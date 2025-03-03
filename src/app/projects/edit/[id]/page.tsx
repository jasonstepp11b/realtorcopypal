"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import ProjectForm from "../../ProjectForm";
import { getProject, updateProject } from "@/lib/supabase/supabaseUtils";
import { PropertyProject } from "../../page";

interface EditProjectPageProps {
  params: {
    id: string;
  };
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [project, setProject] = useState<PropertyProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If auth is still loading, wait
    if (loading) return;

    // If user is not logged in, redirect to sign-in page
    if (!user && !loading) {
      router.push("/auth/sign-in");
      return;
    }

    // Fetch project if user is logged in
    if (user) {
      fetchProject();
    }
  }, [user, loading, router, params.id]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProject(params.id);

      // Check if the project exists and belongs to the current user
      if (!data) {
        setError("Project not found");
        return;
      }

      if (data.user_id !== user?.id) {
        setError("You don't have permission to edit this project");
        return;
      }

      setProject(data as PropertyProject);
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Failed to load project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<PropertyProject>) => {
    if (!user) {
      alert("You must be logged in to update a project");
      return;
    }

    try {
      setIsSubmitting(true);

      // Update the project in the database
      await updateProject(params.id, data);

      // Redirect to the projects page
      router.push("/projects");
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <div className="mt-12 flex justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Error</h1>
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{error}</p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => router.push("/projects")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Property Project
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Update the details of your property project
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {project && (
            <ProjectForm
              project={project}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
