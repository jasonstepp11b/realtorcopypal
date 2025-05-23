"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmailCampaignForm from "@/app/email-campaign/EmailCampaignForm";
import EmailCampaignResults from "@/app/email-campaign/EmailCampaignResults";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Tab } from "@headlessui/react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const defaultFormData = {
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

  // Follow-up series specific
  followUpSequenceType: "market-report",
  customSequenceType: "",
  numberOfEmails: "3",
  emailFrequency: "3-5-7",
  customEmailFrequency: "",
  sequenceGoals: "",
  valueProposition: "",

  // Legacy follow-up fields
  followUpSequence: "initial" as "initial" | "second" | "final",
  initialContactContext: "",
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
};

export default function EmailCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [emailType, setEmailType] = useState<
    "broadcast" | "follow-up" | "transactional"
  >("broadcast");
  const [formData, setFormData] =
    useState<typeof defaultFormData>(defaultFormData);

  const loadProjectData = async (id: string) => {
    try {
      setIsLoadingProject(true);
      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (project) {
        setFormData((prev) => ({
          ...prev,
          propertyAddress: project.propertyAddress || "",
          propertyType: project.propertyType || "",
          propertyPrice: project.listingPrice || "",
          propertyHighlights: project.keyFeatures || "",
        }));
      }
    } catch (error) {
      console.error("Error loading project data:", error);
    } finally {
      setIsLoadingProject(false);
    }
  };

  useEffect(() => {
    const projectId = searchParams?.get("projectId");
    if (projectId) {
      loadProjectData(projectId);
    }
  }, [searchParams]);

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
      {/* Add LoadingOverlay for generation process */}
      <LoadingOverlay
        isLoading={isGenerating}
        message="Generating effective email campaign..."
        generatorType="email-campaign"
      />

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
