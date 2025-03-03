"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import {
  saveGeneration,
  saveProjectContent,
} from "@/lib/supabase/supabaseUtils";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ClipboardIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface PropertyListingResultsProps {
  results: string[];
  onBack: () => void;
  propertyDetails: {
    propertyType: string;
    bedrooms: string;
    bathrooms: string;
    squareFeet: string;
    features: string;
    sellingPoints: string;
    targetBuyer: string;
    tone: string;
    askingPrice: string;
    hoaFees: string;
    propertyImage?: string; // Base64 encoded image
    projectId?: string; // Add projectId to the interface
  };
}

export default function PropertyListingResults({
  results,
  onBack,
  propertyDetails,
}: PropertyListingResultsProps) {
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
      console.log("Starting save process for property listing");

      // Create metadata for the property listing
      const metadata = {
        propertyType: propertyDetails.propertyType,
        bedrooms: propertyDetails.bedrooms,
        bathrooms: propertyDetails.bathrooms,
        squareFeet: propertyDetails.squareFeet,
        tone: propertyDetails.tone,
        title: `${propertyDetails.propertyType} - ${propertyDetails.bedrooms} bed, ${propertyDetails.bathrooms} bath`,
      };

      console.log("Created metadata:", metadata);
      console.log("User ID:", user.id);
      console.log("Content type:", "property-listing");
      console.log("Selected content length:", results[selectedIndex].length);
      console.log("Project ID:", propertyDetails.projectId);

      let savedContent;

      // If we have a projectId, use saveProjectContent
      if (propertyDetails.projectId) {
        savedContent = await saveProjectContent(
          propertyDetails.projectId,
          user.id,
          "property-listing",
          results[selectedIndex],
          metadata
        );
      } else {
        // Fallback to saveGeneration if no projectId
        savedContent = await saveGeneration(
          user.id,
          results[selectedIndex],
          "property-listing",
          JSON.stringify(metadata)
        );
      }

      console.log("Save operation completed, result:", savedContent);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving listing:", error);
      setError(
        "Failed to save. Please try again or check console for details."
      );

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
    a.download = `property-listing-${
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
      <h2 className="text-2xl font-semibold mb-6">Your Generated Listings</h2>

      {/* Display property image if available */}
      {propertyDetails.propertyImage && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Property Image</h3>
          <div className="relative w-full max-w-md h-60 mx-auto">
            <img
              src={propertyDetails.propertyImage}
              alt="Property"
              className="rounded-lg object-cover w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Property details summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <span className="font-medium">Type:</span>{" "}
              {propertyDetails.propertyType}
            </p>
            {propertyDetails.bedrooms && (
              <p>
                <span className="font-medium">Bedrooms:</span>{" "}
                {propertyDetails.bedrooms}
              </p>
            )}
            {propertyDetails.bathrooms && (
              <p>
                <span className="font-medium">Bathrooms:</span>{" "}
                {propertyDetails.bathrooms}
              </p>
            )}
            {propertyDetails.squareFeet && (
              <p>
                <span className="font-medium">Size:</span>{" "}
                {propertyDetails.squareFeet} sq ft
              </p>
            )}
          </div>
          <div>
            {propertyDetails.askingPrice && (
              <p>
                <span className="font-medium">Price:</span>{" "}
                {propertyDetails.askingPrice}
              </p>
            )}
            {propertyDetails.hoaFees && (
              <p>
                <span className="font-medium">HOA Fees:</span>{" "}
                {propertyDetails.hoaFees}
              </p>
            )}
            <p>
              <span className="font-medium">Target Buyer:</span>{" "}
              {propertyDetails.targetBuyer}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Property Listing Copy
        </h2>
        {results.map((result, index) => (
          <div
            key={index}
            className={`border rounded-lg overflow-hidden transition-all ${
              selectedIndex === index
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            {/* Accordion Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleAccordion(index)}
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                    selectedIndex === index
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectVariation(index);
                  }}
                >
                  {selectedIndex === index && (
                    <CheckCircleIcon className="w-5 h-5" />
                  )}
                </div>
                <h3 className="font-medium">Variation {index + 1}</h3>
              </div>
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(result, index);
                  }}
                  className="text-sm flex items-center mr-4 text-gray-500 hover:text-gray-700"
                >
                  <ClipboardIcon className="w-4 h-4 mr-1" />
                  {copied === index ? "Copied!" : "Copy"}
                </button>
                {expandedIndex === index ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>

            {/* Accordion Content */}
            {expandedIndex === index && (
              <div className="p-4 border-t border-gray-200">
                <div className="whitespace-pre-wrap text-gray-700 prose prose-sm max-w-none">
                  {result}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4 justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to Form
        </button>

        <div className="flex gap-3">
          {error && (
            <div className="text-red-600 font-medium mr-3 self-center">
              {error}
            </div>
          )}
          <button
            onClick={handleExport}
            disabled={selectedIndex === null}
            className={`px-4 py-2 border rounded-md flex items-center ${
              selectedIndex === null
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Export as Text
          </button>

          {user ? (
            <button
              onClick={handleSave}
              disabled={selectedIndex === null || isSaving}
              className={`px-4 py-2 rounded-md ${
                selectedIndex === null || isSaving
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSaving
                ? "Saving..."
                : saveSuccess
                ? "Saved!"
                : "Save to Dashboard"}
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
              title="Sign in to save listings"
            >
              Sign in to Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
