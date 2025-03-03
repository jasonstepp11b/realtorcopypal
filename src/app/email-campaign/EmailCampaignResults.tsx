"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import { saveGeneration } from "@/lib/supabase/supabaseUtils";
import {
  ArrowLeftIcon,
  CheckIcon,
  ClipboardIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  BellAlertIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface EmailCampaignResultsProps {
  results: string[];
  onBack: () => void;
  emailDetails: {
    emailType: "broadcast" | "follow-up" | "transactional";
    subject: string;
    targetAudience: string;
    tone: string;
    numberOfEmails?: string;
    followUpSequenceType?: string;
    customSequenceType?: string;
    // Other fields from the form
  };
  emailType: "broadcast" | "follow-up" | "transactional";
}

export default function EmailCampaignResults({
  results,
  onBack,
  emailDetails,
  emailType,
}: EmailCampaignResultsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedEmailInSequence, setSelectedEmailInSequence] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFollowUpSequence = (content: string) => {
    if (emailType !== "follow-up") return [content];

    const emailRegex = /EMAIL #\d+/g;
    const matches = content.match(emailRegex);

    if (!matches) return [content];

    const emails = [];
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];
      const startIndex = content.indexOf(currentMatch) + currentMatch.length;
      const endIndex = nextMatch ? content.indexOf(nextMatch) : content.length;

      emails.push(content.slice(startIndex, endIndex).trim());
    }

    return emails;
  };

  const currentEmails =
    emailType === "follow-up"
      ? parseFollowUpSequence(results[selectedIndex])
      : [results[selectedIndex]];

  const currentEmail =
    emailType === "follow-up" && currentEmails.length > 1
      ? currentEmails[selectedEmailInSequence]
      : results[selectedIndex];

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(selectedIndex);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null); // Clear any previous errors
      console.log("Starting save process for email campaign");

      const selectedContent = results[selectedIndex];
      const emails = parseFollowUpSequence(selectedContent);

      // For follow-up sequences, save all emails in the sequence
      if (emailType === "follow-up" && emails.length > 1) {
        console.log(
          `Saving all ${emails.length} emails in the follow-up sequence`
        );

        // Save each email in the sequence
        const savePromises = emails.map((emailContent, i) => {
          // Create metadata for the email campaign
          const metadata = JSON.stringify({
            emailType: emailDetails.emailType,
            subject: `${emailDetails.subject} - Email ${i + 1} of ${
              emails.length
            }`,
            tone: emailDetails.tone,
            contentType: "Email Campaign",
            sequenceNumber: i + 1,
            totalInSequence: emails.length,
            sequenceType: emailDetails.followUpSequenceType || "follow-up",
          });

          console.log(`Preparing to save email ${i + 1} of ${emails.length}`);

          // Return the promise but don't await it yet
          return saveGeneration(
            user.id,
            emailContent,
            "email-campaign",
            metadata
          );
        });

        // Wait for all saves to complete
        await Promise.all(savePromises);
        console.log("All emails in sequence saved successfully");
      } else {
        // For broadcast or transactional emails, or if there's only one email in the follow-up
        const contentToSave =
          emailType === "follow-up" && emails.length > 1
            ? emails[selectedEmailInSequence]
            : selectedContent;

        // Create metadata for the email campaign
        const metadata = JSON.stringify({
          emailType: emailDetails.emailType,
          subject: emailDetails.subject,
          tone: emailDetails.tone,
          contentType: "Email Campaign",
          sequenceType: emailType,
        });

        console.log("Created metadata:", metadata);
        console.log("User ID:", user.id);
        console.log("Content type:", "email-campaign");
        console.log("Selected content length:", contentToSave.length);

        // Save to Supabase
        await saveGeneration(
          user.id,
          contentToSave,
          "email-campaign",
          metadata
        );
      }

      console.log("Save operation completed successfully");

      setSaved(true);
      setSaving(false); // Ensure saving state is reset
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving email campaign:", error);
      setError(
        "Failed to save. Please try again or check console for details."
      );
      setSaving(false); // Ensure saving state is reset even on error

      // Show error for 5 seconds then clear it
      setTimeout(() => setError(null), 5000);
    }
  };

  const getEmailTypeIcon = () => {
    switch (emailType) {
      case "broadcast":
        return <EnvelopeIcon className="h-5 w-5" />;
      case "follow-up":
        return <ArrowPathIcon className="h-5 w-5" />;
      case "transactional":
        return <BellAlertIcon className="h-5 w-5" />;
      default:
        return <EnvelopeIcon className="h-5 w-5" />;
    }
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

  const getSequenceTypeLabel = () => {
    if (!emailDetails.followUpSequenceType) return "";

    if (
      emailDetails.followUpSequenceType === "other" &&
      emailDetails.customSequenceType
    ) {
      return emailDetails.customSequenceType;
    }

    const sequenceMap: Record<string, string> = {
      "market-report": "Market Report Opt-in",
      "open-house": "Open House Attendee",
      "property-interest": "Property Interest",
      "buyer-consultation": "Buyer Consultation",
      "listing-presentation": "Listing Presentation",
    };

    return (
      sequenceMap[emailDetails.followUpSequenceType] ||
      emailDetails.followUpSequenceType
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Form
        </button>
        <div className="flex items-center text-gray-600">
          {getEmailTypeIcon()}
          <span className="ml-2">{getEmailTypeLabel()}</span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {results.map((_, index) => (
            <button
              key={index}
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                selectedIndex === index
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedIndex(index);
                setSelectedEmailInSequence(0);
              }}
            >
              {results.length > 1
                ? `Version ${index + 1}`
                : "Generated Sequence"}
            </button>
          ))}
        </div>

        {emailType === "follow-up" && currentEmails.length > 1 && (
          <div className="flex flex-wrap border-b border-gray-200 bg-gray-50">
            {currentEmails.map((_, index) => (
              <button
                key={index}
                className={`py-2 px-4 text-xs font-medium ${
                  selectedEmailInSequence === index
                    ? "text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setSelectedEmailInSequence(index)}
              >
                Email {index + 1}
              </button>
            ))}
          </div>
        )}

        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {emailType === "follow-up" && currentEmails.length > 1
                ? `Email ${selectedEmailInSequence + 1} in Sequence`
                : `Subject: ${emailDetails.subject}`}
            </h3>
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              <span>
                {emailType === "broadcast"
                  ? "Broadcast to: "
                  : emailType === "follow-up"
                  ? "Follow-up for: "
                  : "Transactional email for: "}
                {emailDetails.targetAudience}
              </span>

              {emailType === "follow-up" &&
                emailDetails.followUpSequenceType && (
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                    {getSequenceTypeLabel()}
                  </span>
                )}

              {emailType === "follow-up" && emailDetails.numberOfEmails && (
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                  {emailDetails.numberOfEmails} Emails
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-4 whitespace-pre-wrap">
            {currentEmail}
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            {error && (
              <div className="text-red-600 font-medium mr-3 self-center">
                {error}
              </div>
            )}

            <button
              onClick={() => handleCopy(currentEmail)}
              className="btn btn-outline flex items-center"
            >
              {copied === selectedIndex ? (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardIcon className="h-5 w-5 mr-2" />
                  {emailType === "follow-up" && currentEmails.length > 1
                    ? "Copy This Email"
                    : "Copy to Clipboard"}
                </>
              )}
            </button>

            {emailType === "follow-up" && currentEmails.length > 1 && (
              <button
                onClick={() => handleCopy(results[selectedIndex])}
                className="btn btn-outline flex items-center"
              >
                <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                Copy Entire Sequence
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="btn btn-primary flex items-center"
            >
              {saving ? (
                "Saving..."
              ) : saved ? (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                  Save to Dashboard
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-blue-800 mb-2">
          {emailType === "follow-up"
            ? "Follow-Up Sequence Tips"
            : "Email Marketing Tips"}
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          {emailType === "follow-up" ? (
            <>
              <li>
                • Each email should build upon the previous one, creating a
                cohesive story
              </li>
              <li>
                • Gradually increase urgency while maintaining professionalism
              </li>
              <li>• Reference previous emails to create continuity</li>
              <li>• Provide new value in each email to maintain engagement</li>
              <li>
                • Include clear, specific calls-to-action that vary slightly
                across emails
              </li>
            </>
          ) : (
            <>
              <li>
                • Use a clear and compelling subject line to improve open rates
              </li>
              <li>
                • Keep your email focused on a single main message or call to
                action
              </li>
              <li>
                • Personalize emails whenever possible to increase engagement
              </li>
              <li>
                • Test your emails on different devices before sending to your
                list
              </li>
              <li>• Include a clear call-to-action that stands out visually</li>
            </>
          )}
        </ul>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        {error && (
          <div className="flex-1 text-red-600 font-medium">{error}</div>
        )}
        <button
          onClick={handleSave}
          disabled={!user || saving}
          className={`flex items-center px-4 py-2 rounded-md text-white ${
            !user || saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {saving ? (
            "Saving..."
          ) : saved ? (
            <>
              <CheckIcon className="h-5 w-5 mr-2" />
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
