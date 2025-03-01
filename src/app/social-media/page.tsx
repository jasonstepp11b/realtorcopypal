"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SocialMediaForm from "@/app/social-media/SocialMediaForm";
import SocialMediaResults from "@/app/social-media/SocialMediaResults";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function SocialMediaPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleFormSubmit = async (data: typeof formData) => {
    setFormData(data);
    setIsGenerating(true);

    try {
      // Create a copy of the data without the images for the API request
      const { primaryPhoto, ...apiData } = data;

      const response = await fetch("/api/openai/generate-social-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#111827" }}>
          Social Media Post Generator
        </h1>
        <p style={{ color: "#111827" }}>
          Create engaging social media posts that showcase your properties and
          attract potential buyers.
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
        <div className="flex justify-between mt-2">
          <span className="text-sm font-medium" style={{ color: "#111827" }}>
            Enter Details
          </span>
          <span className="text-sm font-medium" style={{ color: "#111827" }}>
            Review Results
          </span>
        </div>
      </div>

      {step === 1 ? (
        <SocialMediaForm
          formData={formData as any}
          onSubmit={handleFormSubmit as any}
          isGenerating={isGenerating}
        />
      ) : (
        <SocialMediaResults
          results={results}
          onBack={handleBack}
          propertyDetails={formData}
        />
      )}

      {/* Loading Overlay */}
      <LoadingOverlay
        isLoading={isGenerating}
        generatorType="social-media"
        message="Generating your social media posts..."
      />
    </div>
  );
}
