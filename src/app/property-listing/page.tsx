"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PropertyListingForm from "@/app/property-listing/PropertyListingForm";
import PropertyListingResults from "@/app/property-listing/PropertyListingResults";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function PropertyListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    features: "",
    sellingPoints: "",
    targetBuyer: "",
    tone: "professional",
    customTone: "",
    askingPrice: "",
    hoaFees: "",
    propertyImage: undefined as string | undefined,
  });

  const handleFormSubmit = async (data: typeof formData) => {
    setFormData(data);
    setIsGenerating(true);

    try {
      // Create a copy of the data without the image for the API request
      const { propertyImage, ...apiData } = data;

      const response = await fetch("/api/openai/generate-listing", {
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
          Property Listing Generator
        </h1>
        <p style={{ color: "#111827" }}>
          Create compelling property descriptions that highlight key features
          and appeal to your target buyers.
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
        <PropertyListingForm
          formData={formData as any}
          onSubmit={handleFormSubmit as any}
          isGenerating={isGenerating}
        />
      ) : (
        <PropertyListingResults
          results={results}
          onBack={handleBack}
          propertyDetails={formData}
        />
      )}

      {/* Loading Overlay */}
      <LoadingOverlay
        isLoading={isGenerating}
        generatorType="property-listing"
        message="Generating your property listings..."
      />
    </div>
  );
}
