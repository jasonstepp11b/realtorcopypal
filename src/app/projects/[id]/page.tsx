"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import {
  getProject,
  getProjectContent,
  deleteProjectContent,
  PropertyProject,
} from "@/lib/supabase/supabaseUtils";
import Link from "next/link";
import {
  TrashIcon,
  ArrowLeftIcon,
  PencilIcon,
  DocumentTextIcon,
  PhotoIcon,
  EnvelopeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/LoadingSpinner";

// Define the project content interface
interface ProjectContentItem {
  id: string;
  project_id: string;
  user_id: string;
  content_type: "property-listing" | "social-media" | "email-campaign";
  content: string;
  metadata?: string;
  parsedMetadata?: any;
  created_at: string;
  updated_at: string;
}

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [project, setProject] = useState<PropertyProject | null>(null);
  const [content, setContent] = useState<ProjectContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [contentTypeCounts, setContentTypeCounts] = useState<
    Record<string, number>
  >({});

  const fetchProject = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getProject(params.id);

      // Check if the project exists and belongs to the current user
      if (!data) {
        setError("Project not found");
        return;
      }

      if (data.user_id !== user.id) {
        setError("You don't have permission to view this project");
        return;
      }

      setProject(data);
      await fetchProjectContent();
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(
        `Failed to load project. Error: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectContent = async () => {
    if (!user) return;

    try {
      const contentType = activeTab !== "all" ? (activeTab as any) : undefined;
      const data = await getProjectContent(params.id, contentType);

      if (!data || data.length === 0) {
        setContent([]);
        setContentTypeCounts({});
        return;
      }

      setContent(data as ProjectContentItem[]);

      // Count content types
      const newCounts: Record<string, number> = {};
      data.forEach((item: any) => {
        const type = item.content_type || "unknown";
        newCounts[type] = (newCounts[type] || 0) + 1;
      });
      setContentTypeCounts(newCounts);
    } catch (err) {
      console.error("Error fetching project content:", err);
      setError(
        `Failed to load project content. Error: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

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

  // Add this useEffect to refetch when the filter changes
  useEffect(() => {
    if (user && project) {
      fetchProjectContent();
    }
  }, [user, activeTab, params.id]);

  const handleDelete = async (id: string) => {
    if (!user) return;

    if (
      window.confirm(
        "Are you sure you want to delete this content? This action cannot be undone."
      )
    ) {
      try {
        setDeleteInProgress(id);
        await deleteProjectContent(id);
        setContent(content.filter((item) => item.id !== id));

        // Update content type counts
        const newCounts = { ...contentTypeCounts };
        const deletedItem = content.find((item) => item.id === id);
        if (deletedItem && deletedItem.content_type) {
          newCounts[deletedItem.content_type] = Math.max(
            0,
            (newCounts[deletedItem.content_type] || 0) - 1
          );
          setContentTypeCounts(newCounts);
        }
      } catch (err) {
        console.error("Error deleting content:", err);
        alert("Failed to delete content. Please try again.");
      } finally {
        setDeleteInProgress(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  // Get unique content types
  const contentTypes = Object.keys(contentTypeCounts);

  // Function to render content based on type
  const renderContent = (item: ProjectContentItem) => {
    // Truncate content to first 150 characters
    const truncatedContent =
      item.content.length > 150
        ? `${item.content.substring(0, 150)}...`
        : item.content;

    return (
      <div>
        <p className="text-gray-700 whitespace-pre-line">{truncatedContent}</p>
      </div>
    );
  };

  // Function to get a friendly name for content type
  const getContentTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      "property-listing": "Property Listing",
      "social-media": "Social Media Post",
      "email-campaign": "Email Campaign",
    };

    return typeMap[type] || type;
  };

  // Function to get a title for the content item
  const getContentTitle = (item: ProjectContentItem) => {
    try {
      // Try to parse the metadata
      if (item.metadata && typeof item.metadata === "string") {
        try {
          const metadata = JSON.parse(item.metadata);

          // Handle email campaign metadata
          if (item.content_type === "email-campaign") {
            const emailType = metadata.emailType || "Email";
            const subject = metadata.subject || "No Subject";

            // For follow-up sequences, show sequence info
            if (metadata.sequenceNumber && metadata.totalInSequence) {
              return `${emailType} - ${subject} (${metadata.sequenceNumber}/${metadata.totalInSequence})`;
            }

            // For regular emails
            return `${emailType} - ${subject}`;
          }

          // For other content types with metadata
          return metadata.title || metadata.subject || "Untitled";
        } catch (e) {
          // If parsing fails, just use a default title
          return `${getContentTypeName(item.content_type)} - ${formatDate(
            item.created_at
          )}`;
        }
      }

      // Default title based on content type
      return `${getContentTypeName(item.content_type)} - ${formatDate(
        item.created_at
      )}`;
    } catch (e) {
      console.error("Error getting content title:", e);
      return "Untitled Content";
    }
  };

  // Filter content based on active tab
  const filteredContent = content.filter(
    (item) => activeTab === "all" || item.content_type === activeTab
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Project Content
            </h1>
            <div className="mt-12 flex justify-center">
              <LoadingSpinner size="large" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Error</h1>
            <div className="mt-6 text-red-600">{error}</div>
            <div className="mt-6">
              <Link href="/projects" className="text-blue-600 hover:underline">
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Project header */}
        <div className="bg-white shadow-sm rounded-lg px-6 py-8 mb-8">
          <div className="flex items-center mb-6">
            <Link
              href="/projects"
              className="text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {project?.name}
            </h1>
            <Link
              href={`/projects/edit/${params.id}`}
              className="ml-4 text-gray-500 hover:text-blue-600"
            >
              <PencilIcon className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-2">{project?.address}</p>
              <div className="flex items-center text-gray-500 mb-3">
                <span className="mr-3">{project?.bedrooms} beds</span>
                <span className="mr-3">{project?.bathrooms} baths</span>
                <span>{project?.square_feet} sqft</span>
              </div>
              <p className="text-blue-600 font-semibold">
                ${project?.listing_price}
              </p>

              {/* Property features */}
              {project?.features && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Features:
                  </h3>
                  <p className="text-sm text-gray-600">{project.features}</p>
                </div>
              )}

              {/* Selling points */}
              {project?.selling_points && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Selling Points:
                  </h3>
                  <p className="text-sm text-gray-600">
                    {project.selling_points}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              {/* Property Image */}
              {project?.image_url && (
                <div className="mb-4 w-full">
                  <img
                    src={project.image_url}
                    alt={project.name}
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2 items-start justify-end mt-auto">
                <Link
                  href={`/property-listing?projectId=${params.id}`}
                  className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-1" />
                  Create Listing
                </Link>

                <Link
                  href={`/social-media?projectId=${params.id}`}
                  className="flex items-center px-3 py-2 bg-purple-50 text-purple-600 rounded-md text-sm hover:bg-purple-100"
                >
                  <PhotoIcon className="w-4 h-4 mr-1" />
                  Create Social Post
                </Link>

                <Link
                  href={`/email-campaign?projectId=${params.id}`}
                  className="flex items-center px-3 py-2 bg-green-50 text-green-600 rounded-md text-sm hover:bg-green-100"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-1" />
                  Create Email
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content tabs */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Content ({content.length})
              </button>

              {contentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === type
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {getContentTypeName(type)} ({contentTypeCounts[type]})
                </button>
              ))}
            </nav>
          </div>

          {/* Content list */}
          <div className="p-6">
            {filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No content found for this project.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Link
                    href={`/property-listing?projectId=${params.id}`}
                    className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Create Property Listing
                  </Link>

                  <Link
                    href={`/social-media?projectId=${params.id}`}
                    className="flex items-center px-4 py-2 bg-purple-50 text-purple-600 rounded-md text-sm hover:bg-purple-100"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Create Social Media Post
                  </Link>

                  <Link
                    href={`/email-campaign?projectId=${params.id}`}
                    className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-md text-sm hover:bg-green-100"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Create Email Campaign
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredContent.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {getContentTitle(item)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/my-content/${item.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={deleteInProgress === item.id}
                        >
                          {deleteInProgress === item.id ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="bg-white rounded p-4 border border-gray-200">
                      {renderContent(item)}
                    </div>
                    <div className="mt-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getContentTypeName(item.content_type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
