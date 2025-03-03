"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import { getGenerations, deleteGeneration } from "@/lib/supabase/supabaseUtils";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

// Define the content type interface
interface ContentItem {
  id: string;
  content: string;
  type: string;
  created_at: string;
  title?: string;
}

export default function MyContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<
    string | undefined
  >(undefined);
  const [contentTypeCounts, setContentTypeCounts] = useState<
    Record<string, number>
  >({});

  const fetchContent = async () => {
    if (!user) {
      console.log("No user found, cannot fetch content");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log(
        "Fetching content for user:",
        user.id,
        "contentType:",
        selectedContentType
      );

      const data = await getGenerations(user.id, selectedContentType);
      console.log("Fetched data:", data?.length || 0, "items");

      if (!data || data.length === 0) {
        console.log("No content found for user");
        setContent([]);
        // Reset content type counts
        setContentTypeCounts({});
        return;
      }

      setContent(data as ContentItem[]);

      // Count content types
      const newCounts: Record<string, number> = {};
      data.forEach((item: any) => {
        const type = item.type || "unknown";
        newCounts[type] = (newCounts[type] || 0) + 1;
      });
      console.log("Content type counts:", newCounts);
      setContentTypeCounts(newCounts);
    } catch (err) {
      console.error("Error fetching content:", err);
      setError(
        `Failed to load your content. Error: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

  // Add this useEffect to refetch when the filter changes
  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user, selectedContentType]);

  const handleDelete = async (id: string) => {
    if (!user) return;

    if (
      window.confirm(
        "Are you sure you want to delete this content? This action cannot be undone."
      )
    ) {
      try {
        setDeleteInProgress(id);
        await deleteGeneration(id);
        setContent(content.filter((item) => item.id !== id));
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
  const renderContent = (item: ContentItem) => {
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
      "property-description": "Property Description",
      "property-listing": "Property Listing",
      "social-media": "Social Media Post",
      "email-campaign": "Email Campaign",
      "blog-post": "Blog Post",
    };

    return typeMap[type] || type;
  };

  // Function to get a title for the content item
  const getContentTitle = (item: ContentItem) => {
    try {
      // Try to parse the title as JSON metadata
      if (item.title && typeof item.title === "string") {
        try {
          const metadata = JSON.parse(item.title);

          // Handle email campaign metadata
          if (item.type === "email-campaign") {
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
          // If parsing fails, just use the title as is
          return item.title;
        }
      }

      // Default title based on content type
      return `${getContentTypeName(item.type)} - ${new Date(
        item.created_at
      ).toLocaleDateString()}`;
    } catch (e) {
      console.error("Error getting content title:", e);
      return "Untitled Content";
    }
  };

  // Filter content based on active tab
  const filteredContent = content.filter(
    (item) => activeTab === "all" || item.type === activeTab
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              My Saved Content
            </h1>
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">My Saved Content</h1>
          <p className="mt-4 text-lg text-gray-600">
            View and manage all your saved realtor copy
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Content type tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All ({content.length})
            </button>

            {contentTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`${
                  activeTab === type
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {getContentTypeName(type)} ({contentTypeCounts[type]})
              </button>
            ))}
          </nav>
        </div>

        {/* Filter UI */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by type
          </label>
          <select
            className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={selectedContentType || ""}
            onChange={(e) =>
              setSelectedContentType(
                e.target.value === "" ? undefined : e.target.value
              )
            }
          >
            <option value="">All content types</option>
            {contentTypes.map((type) => (
              <option key={type} value={type}>
                {getContentTypeName(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Content grid */}
        {filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredContent.map((item) => (
              <div
                key={item.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                        {getContentTypeName(item.type)}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {getContentTitle(item)}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteInProgress === item.id}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Delete content"
                    >
                      {deleteInProgress === item.id ? (
                        <div className="w-5 h-5 border-t-2 border-red-500 rounded-full animate-spin"></div>
                      ) : (
                        <TrashIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {renderContent(item)}
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </span>
                    <Link
                      href={`/my-content/${item.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {selectedContentType
                ? `No ${getContentTypeName(
                    selectedContentType
                  ).toLowerCase()} content found.`
                : "No saved content found."}
            </p>
            <p className="text-gray-500">
              Generate some content to see it here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
