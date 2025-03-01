"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmailCampaignForm from "@/app/email-campaign/EmailCampaignForm";
import EmailCampaignResults from "@/app/email-campaign/EmailCampaignResults";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Tab } from "@headlessui/react";

export default function EmailCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [emailType, setEmailType] = useState<
    "broadcast" | "follow-up" | "transactional"
  >("broadcast");
  const [formData, setFormData] = useState({
    // Common fields
    emailType: "broadcast" as "broadcast" | "follow-up" | "transactional",
    subject: "",
    targetAudience: "",
    tone: "professional",
    customTone: "",

    // Broadcast email specific
    broadcastPurpose: "new-listing",
    customBroadcastPurpose: "",
    newsletterTopic: "",
    promotionDetails: "",
    eventDetails: "",
    marketUpdateInfo: "",

    // New realtor-specific fields for broadcast emails
    propertyAddress: "",
    propertyPrice: "",
    propertyType: "",
    propertyHighlights: "",
    openHouseDate: "",
    openHouseTime: "",
    specialInstructions: "",
    salePrice: "",
    daysOnMarket: "",
    saleHighlights: "",
    previousPrice: "",
    newPrice: "",
    neighborhoodName: "",
    neighborhoodHighlights: "",
    season: "",
    tipsTopic: "",
    tipsContent: "",
    eventName: "",
    eventDate: "",
    eventTime: "",
    eventLocation: "",
    holidayOccasion: "",
    holidayMessage: "",

    // Follow-up series specific (updated for sequence approach)
    followUpSequenceType: "market-report",
    customSequenceType: "",
    numberOfEmails: "3",
    emailFrequency: "3-5-7",
    customEmailFrequency: "",
    initialContactContext: "",
    sequenceGoals: "",
    valueProposition: "",

    // Legacy follow-up fields (kept for backward compatibility)
    followUpSequence: "initial" as "initial" | "second" | "final",
    daysSinceLastContact: "",
    previousInteractionSummary: "",

    // Transactional email specific
    transactionType: "welcome" as
      | "welcome"
      | "open-house"
      | "listing-alert"
      | "appointment"
      | "other",
    customTransactionType: "",
    userName: "",
    propertyDetails: "",
    appointmentDetails: "",
    openHouseDetails: "",

    // Common customization
    callToAction: "",
    companyInfo: "",
    agentName: "",
    agentTitle: "",
    includeTestimonial: false,
    testimonialText: "",
  });

  const handleFormSubmit = async (data: typeof formData) => {
    setFormData(data);
    setIsGenerating(true);
    setEmailType(data.emailType);

    try {
      const response = await fetch("/api/openai/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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

  const getEmailTypeLabel = () => {
    switch (emailType) {
      case "broadcast":
        return "Broadcast Email";
      case "follow-up":
        return "Follow-Up Series";
      case "transactional":
        return "Transactional Email";
      default:
        return "Email Campaign";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#111827" }}>
          Email Copy Generator
        </h1>
        <p style={{ color: "#111827" }}>
          Create professional email campaigns that engage your audience and
          drive results.
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
        <EmailCampaignForm
          formData={formData}
          onSubmit={handleFormSubmit}
          isGenerating={isGenerating}
        />
      ) : (
        <EmailCampaignResults
          results={results}
          onBack={handleBack}
          emailDetails={formData}
          emailType={emailType}
        />
      )}

      {/* Loading Overlay */}
      <LoadingOverlay
        isLoading={isGenerating}
        generatorType="email-campaign"
        message={`Generating your ${getEmailTypeLabel().toLowerCase()} copy...`}
      />
    </div>
  );
}
