"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SocialMediaForm from "@/app/social-media/SocialMediaForm";
import SocialMediaResults from "@/app/social-media/SocialMediaResults";
import LoadingOverlay from "@/components/LoadingOverlay";
import { getProject } from "@/lib/supabase/supabaseUtils";

export default function SocialMediaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get("projectId");

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(!!projectId);
  const [results, setResults] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    // Core property information
    propertyAddress: "",
    listingPrice: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    primaryPhoto: "",

    // Event information (optional)
    hasOpenHouse: false,
    openHouseDetails: "",

    // Content customization
    keyFeatures: "",
    neighborhoodHighlights: "",
    callToAction: "",
    customCallToAction: "",
    listingAgent: "",

    // Social media specific
    platform: "Instagram",
    customPlatform: "",
    targetAudience: "",
    hashtags: "",

    // Style options
    tone: "Professional",
    customTone: "",
  });

  // Load project data if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    }
  }, [projectId]);

  const loadProjectData = async (id: string) => {
    try {
      setIsLoadingProject(true);
      const project = await getProject(id);

      if (project) {
        setFormData({
          ...formData,
          propertyAddress: project.address || "",
          listingPrice: project.listing_price || "",
          propertyType: project.property_type || "",
          bedrooms: project.bedrooms || "",
          bathrooms: project.bathrooms || "",
          squareFeet: project.square_feet || "",
          primaryPhoto: project.image_url || "",
          keyFeatures: project.features || "",
          neighborhoodHighlights: project.neighborhood_highlights || "",
          targetAudience: project.target_buyer || "",
        });
      }
    } catch (error) {
      console.error("Error loading project data:", error);
    } finally {
      setIsLoadingProject(false);
    }
  };

  const handleFormSubmit = async (data: typeof formData) => {
    setFormData(data);
    setIsGenerating(true);

    try {
      // Create a copy of the data without the image for the API request
      const { primaryPhoto, ...apiData } = data;

      const response = await fetch("/api/openai/generate-social-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...apiData,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const result = await response.json();
      setResults(result.variations);
      setStep(2);
    } catch (error) {
      console.error("Error generating content:", error);
      // Handle error state
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  if (isLoadingProject) {
    return (
      <LoadingOverlay isLoading={true} message="Loading project data..." />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Add LoadingOverlay for generation process */}
      <LoadingOverlay
        isLoading={isGenerating}
        message="Generating engaging social media posts..."
        generatorType="social-media"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#111827" }}>
          Social Media Post Generator
        </h1>
        <p style={{ color: "#111827" }}>
          Create engaging social media content to promote your property listings
          and connect with potential buyers.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            1
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${
              step >= 2 ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {step === 1 ? (
        <SocialMediaForm
          formData={formData}
          onSubmit={handleFormSubmit as any}
          isGenerating={isGenerating}
        />
      ) : (
        <SocialMediaResults
          results={results}
          onBack={handleBack}
          propertyDetails={{
            ...formData,
            projectId: projectId || undefined,
          }}
        />
      )}
    </div>
  );
}
