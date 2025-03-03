"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import { supabase } from "@/lib/supabase/supabase";
import Link from "next/link";

interface ContentItem {
  id: string;
  user_id: string;
  content: string;
  type?: string;
  content_type?: string; // For project_content table
  title?: string;
  metadata?: string; // For project_content table
  created_at: string;
  project_id?: string;
}

export default function ContentDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [contentSource, setContentSource] = useState<
    "generations" | "project_content"
  >("generations");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Redirect to login if not authenticated
      router.push("/auth/sign-in");
      return;
    }

    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // First try to fetch from generations table
        let { data: generationsData, error: generationsError } = await supabase
          .from("generations")
          .select("*")
          .eq("id", id)
          .single();

        // If not found in generations, try project_content table
        if (generationsError || !generationsData) {
          console.log(
            "Content not found in generations table, trying project_content"
          );
          const { data: projectContentData, error: projectContentError } =
            await supabase
              .from("project_content")
              .select("*")
              .eq("id", id)
              .single();

          if (projectContentError) {
            console.error(
              "Error fetching from project_content:",
              projectContentError
            );
            throw new Error("Content not found in either table");
          }

          if (!projectContentData) {
            setError("Content not found.");
            return;
          }

          // Check if this content belongs to the current user
          if (projectContentData.user_id !== user.id) {
            setError("You don't have permission to view this content.");
            return;
          }

          // Map project_content fields to match our interface
          const mappedContent: ContentItem = {
            ...projectContentData,
            type: projectContentData.content_type, // Map content_type to type for consistency
          };

          setContent(mappedContent);
          setContentSource("project_content");

          // Parse metadata if it exists
          if (projectContentData.metadata) {
            try {
              const parsedMetadata = JSON.parse(projectContentData.metadata);
              setMetadata(parsedMetadata);
            } catch (e) {
              console.error("Error parsing metadata:", e);
              setMetadata(null);
            }
          }
        } else {
          // Content found in generations table
          // Check if this content belongs to the current user
          if (generationsData.user_id !== user.id) {
            setError("You don't have permission to view this content.");
            return;
          }

          setContent(generationsData);
          setContentSource("generations");

          // Parse metadata from title if it exists
          if (generationsData.title) {
            try {
              const parsedMetadata = JSON.parse(generationsData.title);
              setMetadata(parsedMetadata);
            } catch (e) {
              console.error("Error parsing metadata:", e);
              // If parsing fails, just use the title as is
              setMetadata({ title: generationsData.title });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching content:", err);
        setError("Failed to load content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id, user, loading, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to get a friendly name for content type
  const getContentTypeName = (type?: string) => {
    if (!type) return "Unknown";

    switch (type) {
      case "property-listing":
        return "Property Listing";
      case "social-media":
        return "Social Media";
      case "email-campaign":
        return "Email Campaign";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ");
    }
  };

  // Function to get a title for the content
  const getContentTitle = () => {
    if (!content) return "";

    if (metadata) {
      // For email campaigns
      if (
        content.type === "email-campaign" ||
        content.content_type === "email-campaign"
      ) {
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
    }

    // Default title based on content type
    return `${getContentTypeName(content.type || content.content_type)}`;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-12"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-700 mb-6">{error}</p>
              <Link
                href="/my-content"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to My Content
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Content Not Found
              </h1>
              <p className="text-gray-700 mb-6">
                The content you&apos;re looking for doesn&apos;t exist or has
                been deleted.
              </p>
              <Link
                href="/my-content"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to My Content
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getContentTitle()}
                </h1>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                    {getContentTypeName(content?.type || content?.content_type)}
                  </span>
                  <p className="text-sm text-gray-500">
                    Created on {formatDate(content?.created_at || "")}
                  </p>
                </div>
              </div>
              {content?.project_id ? (
                <Link
                  href={`/projects/${content.project_id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-2"
                >
                  Back to Project
                </Link>
              ) : (
                <Link
                  href="/my-content"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to List
                </Link>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {(content?.type === "email-campaign" ||
              content?.content_type === "email-campaign") && (
              <div className="mb-4 p-4 bg-blue-50 rounded-md">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  {metadata?.emailType === "follow-up"
                    ? "Follow-up Email"
                    : "Email Campaign"}
                </h2>
                {metadata?.sequenceNumber && metadata?.totalInSequence && (
                  <p className="text-sm text-gray-600 mb-2">
                    Email {metadata.sequenceNumber} of{" "}
                    {metadata.totalInSequence} in sequence
                  </p>
                )}
                {metadata?.subject && (
                  <p className="text-md font-medium">
                    Subject: {metadata.subject}
                  </p>
                )}
              </div>
            )}
            <div className="prose max-w-none">
              {/* Display content with proper formatting */}
              {content?.content
                .split("\n")
                .map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4 text-gray-800">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-3">
                Content Details
              </h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                {Object.entries(metadata).map(([key, value]: [string, any]) => {
                  // Skip rendering if value is an object or array
                  if (typeof value === "object") return null;

                  return (
                    <div key={key} className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        {key.charAt(0).toUpperCase() +
                          key.slice(1).replace(/([A-Z])/g, " $1")}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {value.toString()}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={() => {
                  if (content?.content) {
                    navigator.clipboard.writeText(content.content);
                    alert("Content copied to clipboard!");
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Copy to Clipboard
              </button>

              {content?.project_id ? (
                <Link
                  href={`/projects/${content.project_id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Project
                </Link>
              ) : (
                <Link
                  href={`/my-content/edit/${id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit Content
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
