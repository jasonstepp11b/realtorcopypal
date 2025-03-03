"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import { saveProjectContent } from "@/lib/supabase/supabaseUtils";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ClipboardIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface SocialMediaResultsProps {
  results: string[];
  onBack: () => void;
  propertyDetails: {
    // Core property information
    propertyAddress: string;
    listingPrice: string;
    propertyType: string;
    bedrooms: string;
    bathrooms: string;
    squareFeet: string;
    primaryPhoto?: string;

    // Event information (optional)
    hasOpenHouse: boolean;
    openHouseDetails: string;

    // Content customization
    keyFeatures: string;
    neighborhoodHighlights: string;
    callToAction: string;
    listingAgent: string;

    // Social media specific
    platform: string;
    targetAudience: string;
    hashtags: string;

    // Style options
    tone: string;

    // Project ID
    projectId?: string;
  };
}

export default function SocialMediaResults({
  results,
  onBack,
  propertyDetails,
}: SocialMediaResultsProps) {
  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // Default first one open
  const [error, setError] = useState<string | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = async () => {
    if (!user || selectedIndex === null) return;

    try {
      setIsSaving(true);
      setError(null); // Clear any previous errors
      console.log("Starting save process for social media post");

      // Create metadata for the social media post
      const metadata = {
        platform: propertyDetails.platform,
        contentType: "Social Media Post",
        tone: propertyDetails.tone,
        propertyAddress: propertyDetails.propertyAddress,
        listingPrice: propertyDetails.listingPrice,
        propertyType: propertyDetails.propertyType,
        bedrooms: propertyDetails.bedrooms,
        bathrooms: propertyDetails.bathrooms,
        squareFeet: propertyDetails.squareFeet,
        hasOpenHouse: propertyDetails.hasOpenHouse,
        openHouseDetails: propertyDetails.openHouseDetails,
        keyFeatures: propertyDetails.keyFeatures,
        neighborhoodHighlights: propertyDetails.neighborhoodHighlights,
        callToAction: propertyDetails.callToAction,
        listingAgent: propertyDetails.listingAgent,
        targetAudience: propertyDetails.targetAudience,
        hashtags: propertyDetails.hashtags,
        variation: selectedIndex + 1,
      };

      console.log("Created metadata:", metadata);
      console.log("User ID:", user.id);
      console.log("Content type:", "social-media");
      console.log("Selected content length:", results[selectedIndex].length);
      console.log("Project ID:", propertyDetails.projectId);

      if (!propertyDetails.projectId) {
        setError("Unable to save: No project ID provided. Please try again.");
        return;
      }

      // Save to project content
      const savedContent = await saveProjectContent(
        propertyDetails.projectId,
        user.id,
        "social-media",
        results[selectedIndex],
        metadata
      );

      console.log("Save operation completed, result:", savedContent);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: unknown) {
      console.error("Error saving social media post:", error);

      // Handle Supabase errors specifically
      if (error && typeof error === "object" && "code" in error) {
        const supabaseError = error as { code: string; message: string };
        if (supabaseError.code === "42501") {
          setError("Permission denied. Please make sure you're logged in.");
        } else if (supabaseError.code === "23503") {
          setError(
            "Project not found. Please try again or create a new project."
          );
        } else {
          setError(`Database error: ${supabaseError.message}`);
        }
      } else {
        // Handle other types of errors
        setError(
          error instanceof Error
            ? `Failed to save: ${error.message}`
            : "Failed to save. Please try again or check console for details."
        );
      }

      // Show error for 5 seconds then clear it
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (selectedIndex === null) return;

    const content = results[selectedIndex];
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `social-media-post-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const selectVariation = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">
        Your Generated Social Media Posts
      </h2>
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          ← Back to Form
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`border rounded-lg ${
              selectedIndex === index ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <div
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleAccordion(index)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="selected-variation"
                  checked={selectedIndex === index}
                  onChange={() => selectVariation(index)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="font-medium">Variation {index + 1}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(result, index);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  {copied === index ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5" />
                  )}
                </button>
                {expandedIndex === index ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </div>
            </div>
            {expandedIndex === index && (
              <div className="p-4 border-t border-gray-200">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        {error && (
          <div className="flex-1 text-red-600 font-medium">{error}</div>
        )}
        <button
          onClick={handleExport}
          disabled={selectedIndex === null}
          className={`flex items-center px-4 py-2 rounded-md border ${
            selectedIndex === null
              ? "border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Export as Text
        </button>
        <button
          onClick={handleSave}
          disabled={selectedIndex === null || isSaving}
          className={`flex items-center px-4 py-2 rounded-md text-white ${
            selectedIndex === null || isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSaving ? (
            "Saving..."
          ) : saveSuccess ? (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Saved!
            </>
          ) : (
            "Save to Library"
          )}
        </button>
      </div>
    </div>
  );
}
