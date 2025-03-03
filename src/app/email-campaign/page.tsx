"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmailCampaignForm from "@/app/email-campaign/EmailCampaignForm";
import EmailCampaignResults from "@/app/email-campaign/EmailCampaignResults";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Tab } from "@headlessui/react";
import { getProject } from "@/lib/supabase/supabaseUtils";

export default function EmailCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get("projectId");

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(!!projectId);
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
    followUpStage: "initial-inquiry",
    customFollowUpStage: "",
    daysSinceContact: "3",
    previousInteractionSummary: "",
    nextSteps: "",

    // Transactional email specific
    transactionType: "offer-accepted",
    customTransactionType: "",
    clientName: "",
    userName: "",
    propertyDetails: "",
    transactionDetails: "",
    deadlineDate: "",
    requiredAction: "",
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
          propertyPrice: project.listing_price || "",
          propertyType: project.property_type || "",
          propertyHighlights: project.features || "",
          neighborhoodHighlights: project.neighborhood_highlights || "",
          targetAudience: project.target_buyer || "",
          propertyDetails: `${project.bedrooms || ""} bed, ${
            project.bathrooms || ""
          } bath, ${project.square_feet || ""} sq ft ${
            project.property_type || ""
          } at ${project.address || ""}`,
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
        return "Follow-up Sequence";
      case "transactional":
        return "Transactional Email";
      default:
        return "Email Campaign";
    }
  };

  if (isLoadingProject) {
    return (
      <LoadingOverlay isLoading={true} message="Loading project data..." />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#111827" }}>
          Email Campaign Generator
        </h1>
        <p style={{ color: "#111827" }}>
          Create effective email campaigns to nurture leads, follow up with
          clients, and close more deals.
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
        <>
          <Tab.Group
            onChange={(index) => {
              setEmailType(
                index === 0
                  ? "broadcast"
                  : index === 1
                  ? "follow-up"
                  : "transactional"
              );
            }}
          >
            <Tab.List className="flex rounded-xl bg-blue-50 p-1 mb-6">
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                  ${
                    selected
                      ? "bg-white text-blue-700 shadow"
                      : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"
                  }
                  `
                }
              >
                Broadcast
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                  ${
                    selected
                      ? "bg-white text-blue-700 shadow"
                      : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"
                  }
                  `
                }
              >
                Follow-up
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                  ${
                    selected
                      ? "bg-white text-blue-700 shadow"
                      : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"
                  }
                  `
                }
              >
                Transactional
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <EmailCampaignForm
                  formData={formData as any}
                  onSubmit={handleFormSubmit as any}
                  isGenerating={isGenerating}
                  emailType="broadcast"
                />
              </Tab.Panel>
              <Tab.Panel>
                <EmailCampaignForm
                  formData={formData as any}
                  onSubmit={handleFormSubmit as any}
                  isGenerating={isGenerating}
                  emailType="follow-up"
                />
              </Tab.Panel>
              <Tab.Panel>
                <EmailCampaignForm
                  formData={formData as any}
                  onSubmit={handleFormSubmit as any}
                  isGenerating={isGenerating}
                  emailType="transactional"
                />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </>
      ) : (
        <EmailCampaignResults
          results={results}
          onBack={handleBack}
          emailType={emailType}
          emailDetails={formData}
        />
      )}
    </div>
  );
}
