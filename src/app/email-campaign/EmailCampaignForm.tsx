"use client";

import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import {
  EnvelopeIcon,
  ArrowPathIcon,
  BellAlertIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  UserGroupIcon,
  MegaphoneIcon,
  NewspaperIcon,
  TagIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface EmailCampaignFormProps {
  formData: {
    // Common fields
    emailType: "broadcast" | "follow-up" | "transactional";
    subject: string;
    targetAudience: string;
    tone: string;
    customTone?: string;

    // Broadcast email specific
    broadcastPurpose: string;
    customBroadcastPurpose?: string;
    newsletterTopic: string;
    promotionDetails: string;
    eventDetails: string;
    marketUpdateInfo: string;

    // New realtor-specific fields for broadcast emails
    propertyAddress?: string;
    propertyPrice?: string;
    propertyType?: string;
    propertyHighlights?: string;
    openHouseDate?: string;
    openHouseTime?: string;
    specialInstructions?: string;
    salePrice?: string;
    daysOnMarket?: string;
    saleHighlights?: string;
    previousPrice?: string;
    newPrice?: string;
    neighborhoodName?: string;
    neighborhoodHighlights?: string;
    season?: string;
    tipsTopic?: string;
    tipsContent?: string;
    eventName?: string;
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    holidayOccasion?: string;
    holidayMessage?: string;

    // Follow-up series specific (updated for sequence approach)
    followUpSequenceType?: string;
    customSequenceType?: string;
    numberOfEmails?: string;
    emailFrequency?: string;
    customEmailFrequency?: string;
    sequenceGoals?: string;
    valueProposition?: string;

    // Legacy follow-up fields
    followUpSequence: "initial" | "second" | "final";
    initialContactContext: string;
    daysSinceLastContact: string;
    previousInteractionSummary: string;

    // Transactional email specific
    transactionType:
      | "welcome"
      | "open-house"
      | "listing-alert"
      | "appointment"
      | "other";
    customTransactionType?: string;
    userName: string;
    propertyDetails: string;
    appointmentDetails: string;
    openHouseDetails: string;

    // Common customization
    callToAction: string;
    companyInfo: string;
    agentName: string;
    agentTitle: string;
    includeTestimonial: boolean;
    testimonialText: string;
  };
  onSubmit: (data: any) => void;
  isGenerating: boolean;
}

export default function EmailCampaignForm({
  formData,
  onSubmit,
  isGenerating,
}: EmailCampaignFormProps) {
  const [localFormData, setLocalFormData] = useState(formData);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isOtherBroadcastPurpose, setIsOtherBroadcastPurpose] = useState(false);
  const [isOtherTone, setIsOtherTone] = useState(false);
  const [isOtherTransactionType, setIsOtherTransactionType] = useState(false);

  // Check for initial values that might be "Other"
  useEffect(() => {
    // Check if broadcastPurpose is not in the standard options
    const standardBroadcastPurposes = [
      "new-listing",
      "open-house",
      "just-sold",
      "price-reduction",
      "market-update",
      "neighborhood",
      "home-tips",
      "client-event",
      "holiday",
    ];

    if (
      formData.broadcastPurpose &&
      !standardBroadcastPurposes.includes(formData.broadcastPurpose)
    ) {
      setIsOtherBroadcastPurpose(true);
      setLocalFormData((prev) => ({
        ...prev,
        customBroadcastPurpose: formData.broadcastPurpose,
      }));
    }

    // Check if tone is not in the standard options
    const standardTones = [
      "professional",
      "friendly",
      "formal",
      "urgent",
      "informative",
      "luxurious",
      "personal",
    ];

    if (formData.tone && !standardTones.includes(formData.tone)) {
      setIsOtherTone(true);
      setLocalFormData((prev) => ({
        ...prev,
        customTone: formData.tone,
      }));
    }

    // Check if transactionType is not in the standard options
    const standardTransactionTypes = [
      "welcome",
      "open-house",
      "listing-alert",
      "appointment",
    ];

    if (
      formData.transactionType &&
      !standardTransactionTypes.includes(formData.transactionType)
    ) {
      setIsOtherTransactionType(true);
      setLocalFormData((prev) => ({
        ...prev,
        customTransactionType: formData.transactionType,
      }));
    }
  }, [formData]);

  // Update local form data when emailType changes
  useEffect(() => {
    setLocalFormData((prev) => ({
      ...prev,
      emailType:
        selectedTabIndex === 0
          ? "broadcast"
          : selectedTabIndex === 1
          ? "follow-up"
          : "transactional",
    }));
  }, [selectedTabIndex]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setLocalFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      // Special handling for fields with "Other" option
      if (name === "broadcastPurpose") {
        if (value === "other") {
          setIsOtherBroadcastPurpose(true);
        } else {
          setIsOtherBroadcastPurpose(false);
          setLocalFormData((prev) => ({
            ...prev,
            customBroadcastPurpose: "",
            broadcastPurpose: value,
          }));
        }
      } else if (name === "tone") {
        if (value === "other") {
          setIsOtherTone(true);
        } else {
          setIsOtherTone(false);
          setLocalFormData((prev) => ({
            ...prev,
            customTone: "",
            tone: value,
          }));
        }
      } else if (name === "transactionType") {
        if (value === "other") {
          setIsOtherTransactionType(true);
        } else {
          setIsOtherTransactionType(false);
          setLocalFormData((prev) => ({
            ...prev,
            customTransactionType: "",
            transactionType: value as any,
          }));
        }
      }

      // Standard field update
      setLocalFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data for submission
    const submissionData = { ...localFormData };

    // Set the actual values from custom fields if "Other" is selected
    if (isOtherBroadcastPurpose && localFormData.customBroadcastPurpose) {
      submissionData.broadcastPurpose = localFormData.customBroadcastPurpose;
    }

    if (isOtherTone && localFormData.customTone) {
      submissionData.tone = localFormData.customTone;
    }

    if (isOtherTransactionType && localFormData.customTransactionType) {
      submissionData.transactionType =
        localFormData.customTransactionType as any;
    }

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tab.Group
        selectedIndex={selectedTabIndex}
        onChange={setSelectedTabIndex}
      >
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-100 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"
              }`
            }
          >
            <div className="flex items-center justify-center">
              <MegaphoneIcon className="h-5 w-5 mr-2" />
              Broadcast Email
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"
              }`
            }
          >
            <div className="flex items-center justify-center">
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Follow-Up Series
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"
              }`
            }
          >
            <div className="flex items-center justify-center">
              <BellAlertIcon className="h-5 w-5 mr-2" />
              Transactional Email
            </div>
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-6">
          {/* Broadcast Email Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Line */}
                <div className="col-span-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject Line
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={localFormData.subject}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter an attention-grabbing subject line"
                    required
                  />
                </div>

                {/* Broadcast Purpose */}
                <div>
                  <label
                    htmlFor="broadcastPurpose"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Purpose
                  </label>
                  <select
                    id="broadcastPurpose"
                    name="broadcastPurpose"
                    value={
                      isOtherBroadcastPurpose
                        ? "other"
                        : localFormData.broadcastPurpose
                    }
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="new-listing">
                      New Listing Announcement
                    </option>
                    <option value="open-house">Open House Invitation</option>
                    <option value="just-sold">Just Sold Announcement</option>
                    <option value="price-reduction">
                      Price Reduction Alert
                    </option>
                    <option value="market-update">Market Update</option>
                    <option value="neighborhood">
                      Neighborhood Newsletter
                    </option>
                    <option value="home-tips">Seasonal Home Tips</option>
                    <option value="client-event">
                      Client Appreciation Event
                    </option>
                    <option value="holiday">Holiday/Seasonal Greeting</option>
                    <option value="other">Other (Custom)</option>
                  </select>
                </div>

                {isOtherBroadcastPurpose && (
                  <div className="mt-2">
                    <input
                      type="text"
                      id="customBroadcastPurpose"
                      name="customBroadcastPurpose"
                      value={localFormData.customBroadcastPurpose || ""}
                      onChange={handleInputChange}
                      placeholder="Enter custom email purpose"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                )}

                {/* Target Audience */}
                <div>
                  <label
                    htmlFor="targetAudience"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Target Audience
                  </label>
                  <input
                    type="text"
                    id="targetAudience"
                    name="targetAudience"
                    value={localFormData.targetAudience}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., First-time homebuyers, Investors, Past clients"
                    required
                  />
                </div>
              </div>

              {/* Conditional fields based on broadcast purpose */}
              {localFormData.broadcastPurpose === "new-listing" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="propertyAddress"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Property Address
                    </label>
                    <input
                      type="text"
                      id="propertyAddress"
                      name="propertyAddress"
                      value={localFormData.propertyAddress || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter the property address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="propertyPrice"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Asking Price
                      </label>
                      <input
                        type="text"
                        id="propertyPrice"
                        name="propertyPrice"
                        value={localFormData.propertyPrice || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. $450,000"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="propertyType"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Property Type
                      </label>
                      <input
                        type="text"
                        id="propertyType"
                        name="propertyType"
                        value={localFormData.propertyType || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. Single Family Home, Condo"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="propertyHighlights"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Property Highlights
                    </label>
                    <textarea
                      id="propertyHighlights"
                      name="propertyHighlights"
                      value={localFormData.propertyHighlights || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Key features and selling points of the property"
                      required
                    />
                  </div>
                </div>
              )}

              {localFormData.broadcastPurpose === "open-house" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="propertyAddress"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Property Address
                    </label>
                    <input
                      type="text"
                      id="propertyAddress"
                      name="propertyAddress"
                      value={localFormData.propertyAddress || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter the property address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="openHouseDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Open House Date
                      </label>
                      <input
                        type="text"
                        id="openHouseDate"
                        name="openHouseDate"
                        value={localFormData.openHouseDate || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. Saturday, June 15"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="openHouseTime"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Open House Time
                      </label>
                      <input
                        type="text"
                        id="openHouseTime"
                        name="openHouseTime"
                        value={localFormData.openHouseTime || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. 1:00 PM - 4:00 PM"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="propertyHighlights"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Property Highlights
                    </label>
                    <textarea
                      id="propertyHighlights"
                      name="propertyHighlights"
                      value={localFormData.propertyHighlights || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Key features and selling points of the property"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="specialInstructions"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      id="specialInstructions"
                      name="specialInstructions"
                      value={localFormData.specialInstructions || ""}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Any special instructions for attendees (parking, COVID protocols, etc.)"
                    />
                  </div>
                </div>
              )}

              {localFormData.broadcastPurpose === "just-sold" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="propertyAddress"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Property Address
                    </label>
                    <input
                      type="text"
                      id="propertyAddress"
                      name="propertyAddress"
                      value={localFormData.propertyAddress || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter the property address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="salePrice"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Sale Price (Optional)
                      </label>
                      <input
                        type="text"
                        id="salePrice"
                        name="salePrice"
                        value={localFormData.salePrice || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. $450,000 or 'Above Asking'"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="daysOnMarket"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Days on Market (Optional)
                      </label>
                      <input
                        type="text"
                        id="daysOnMarket"
                        name="daysOnMarket"
                        value={localFormData.daysOnMarket || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. 14 days or 'Just 2 weeks'"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="saleHighlights"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Sale Highlights
                    </label>
                    <textarea
                      id="saleHighlights"
                      name="saleHighlights"
                      value={localFormData.saleHighlights || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Noteworthy aspects of the sale (multiple offers, quick sale, etc.)"
                      required
                    />
                  </div>
                </div>
              )}

              {localFormData.broadcastPurpose === "price-reduction" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="propertyAddress"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Property Address
                    </label>
                    <input
                      type="text"
                      id="propertyAddress"
                      name="propertyAddress"
                      value={localFormData.propertyAddress || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter the property address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="previousPrice"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Previous Price
                      </label>
                      <input
                        type="text"
                        id="previousPrice"
                        name="previousPrice"
                        value={localFormData.previousPrice || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. $499,000"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="newPrice"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        New Price
                      </label>
                      <input
                        type="text"
                        id="newPrice"
                        name="newPrice"
                        value={localFormData.newPrice || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. $475,000"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="propertyHighlights"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Property Highlights
                    </label>
                    <textarea
                      id="propertyHighlights"
                      name="propertyHighlights"
                      value={localFormData.propertyHighlights || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Key features and selling points of the property"
                      required
                    />
                  </div>
                </div>
              )}

              {localFormData.broadcastPurpose === "market-update" && (
                <div>
                  <label
                    htmlFor="marketUpdateInfo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Market Update Information
                  </label>
                  <textarea
                    id="marketUpdateInfo"
                    name="marketUpdateInfo"
                    value={localFormData.marketUpdateInfo || ""}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Provide key market statistics or trends you want to highlight (inventory levels, average days on market, price trends, etc.)"
                    required
                  />
                </div>
              )}

              {localFormData.broadcastPurpose === "neighborhood" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="neighborhoodName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Neighborhood/Area Name
                    </label>
                    <input
                      type="text"
                      id="neighborhoodName"
                      name="neighborhoodName"
                      value={localFormData.neighborhoodName || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Name of the neighborhood or area"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="neighborhoodHighlights"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Neighborhood Highlights & Updates
                    </label>
                    <textarea
                      id="neighborhoodHighlights"
                      name="neighborhoodHighlights"
                      value={localFormData.neighborhoodHighlights || ""}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Recent developments, community events, local business news, market trends specific to this area"
                      required
                    />
                  </div>
                </div>
              )}

              {localFormData.broadcastPurpose === "home-tips" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="season"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Season/Occasion
                    </label>
                    <select
                      id="season"
                      name="season"
                      value={localFormData.season || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a season/occasion</option>
                      <option value="spring">Spring</option>
                      <option value="summer">Summer</option>
                      <option value="fall">Fall</option>
                      <option value="winter">Winter</option>
                      <option value="holiday">Holiday Season</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="tipsTopic"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Home Tips Topic
                    </label>
                    <input
                      type="text"
                      id="tipsTopic"
                      name="tipsTopic"
                      value={localFormData.tipsTopic || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g. Winterizing Your Home, Summer Lawn Care, etc."
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tipsContent"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tips Content
                    </label>
                    <textarea
                      id="tipsContent"
                      name="tipsContent"
                      value={localFormData.tipsContent || ""}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Outline the home maintenance or improvement tips you want to share"
                      required
                    />
                  </div>
                </div>
              )}

              {localFormData.broadcastPurpose === "client-event" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="eventName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Event Name
                    </label>
                    <input
                      type="text"
                      id="eventName"
                      name="eventName"
                      value={localFormData.eventName || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g. Client Appreciation Brunch, Summer BBQ"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="eventDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Event Date
                      </label>
                      <input
                        type="text"
                        id="eventDate"
                        name="eventDate"
                        value={localFormData.eventDate || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. Saturday, August 20"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="eventTime"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Event Time
                      </label>
                      <input
                        type="text"
                        id="eventTime"
                        name="eventTime"
                        value={localFormData.eventTime || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. 1:00 PM - 4:00 PM"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="eventLocation"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Event Location
                    </label>
                    <input
                      type="text"
                      id="eventLocation"
                      name="eventLocation"
                      value={localFormData.eventLocation || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Address or venue name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="eventDetails"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Event Details
                    </label>
                    <textarea
                      id="eventDetails"
                      name="eventDetails"
                      value={localFormData.eventDetails || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Description of the event, what to expect, any special instructions"
                      required
                    />
                  </div>
                </div>
              )}

              {localFormData.broadcastPurpose === "holiday" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="holidayOccasion"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Holiday/Occasion
                    </label>
                    <input
                      type="text"
                      id="holidayOccasion"
                      name="holidayOccasion"
                      value={localFormData.holidayOccasion || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g. Thanksgiving, New Year, Spring Season"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="holidayMessage"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Holiday Message
                    </label>
                    <textarea
                      id="holidayMessage"
                      name="holidayMessage"
                      value={localFormData.holidayMessage || ""}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Your seasonal greeting or message to clients"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Fallback for the original newsletter option if somehow selected */}
              {localFormData.broadcastPurpose === "newsletter" && (
                <div>
                  <label
                    htmlFor="newsletterTopic"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Newsletter Topic
                  </label>
                  <textarea
                    id="newsletterTopic"
                    name="newsletterTopic"
                    value={localFormData.newsletterTopic || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe the main topic(s) of your newsletter"
                    required
                  />
                </div>
              )}

              {/* Fallback for the original promotion option if somehow selected */}
              {localFormData.broadcastPurpose === "promotion" && (
                <div>
                  <label
                    htmlFor="promotionDetails"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Promotion Details
                  </label>
                  <textarea
                    id="promotionDetails"
                    name="promotionDetails"
                    value={localFormData.promotionDetails || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe your special offer, discount, or promotion"
                    required
                  />
                </div>
              )}

              {/* Fallback for the original event option if somehow selected */}
              {localFormData.broadcastPurpose === "event" && (
                <div>
                  <label
                    htmlFor="eventDetails"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Event Details
                  </label>
                  <textarea
                    id="eventDetails"
                    name="eventDetails"
                    value={localFormData.eventDetails || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe your event (date, time, location, purpose)"
                    required
                  />
                </div>
              )}
            </div>
          </Tab.Panel>

          {/* Follow-Up Series Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Line Prefix */}
                <div className="col-span-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject Line Prefix
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={localFormData.subject}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="This will be used as the base for all subject lines in your sequence"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We&apos;ll add appropriate variations for each email in the
                    sequence
                  </p>
                </div>

                {/* Sequence Type */}
                <div>
                  <label
                    htmlFor="followUpSequenceType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sequence Type
                  </label>
                  <select
                    id="followUpSequenceType"
                    name="followUpSequenceType"
                    value={
                      localFormData.followUpSequenceType || "market-report"
                    }
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="market-report">
                      Market Report Opt-in Follow-ups
                    </option>
                    <option value="open-house">
                      Open House Attendee Follow-ups
                    </option>
                    <option value="property-interest">
                      Property Interest Follow-ups
                    </option>
                    <option value="buyer-consultation">
                      Buyer Consultation Follow-ups
                    </option>
                    <option value="listing-presentation">
                      Listing Presentation Follow-ups
                    </option>
                    <option value="other">Other (custom sequence)</option>
                  </select>
                </div>

                {/* Custom Sequence Type (conditional) */}
                {localFormData.followUpSequenceType === "other" && (
                  <div>
                    <label
                      htmlFor="customSequenceType"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Custom Sequence Type
                    </label>
                    <input
                      type="text"
                      id="customSequenceType"
                      name="customSequenceType"
                      value={localFormData.customSequenceType || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Describe your custom follow-up sequence"
                      required={localFormData.followUpSequenceType === "other"}
                    />
                  </div>
                )}

                {/* Number of Emails */}
                <div>
                  <label
                    htmlFor="numberOfEmails"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of Emails in Sequence
                  </label>
                  <select
                    id="numberOfEmails"
                    name="numberOfEmails"
                    value={localFormData.numberOfEmails || "3"}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="2">2 Emails</option>
                    <option value="3">3 Emails</option>
                    <option value="4">4 Emails</option>
                    <option value="5">5 Emails</option>
                  </select>
                </div>

                {/* Days Between Emails */}
                <div className="col-span-2">
                  <label
                    htmlFor="emailFrequency"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Timing Between Emails
                  </label>
                  <select
                    id="emailFrequency"
                    name="emailFrequency"
                    value={localFormData.emailFrequency || "3-5-7"}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="3-5-7">3-5-7 Days (Recommended)</option>
                    <option value="7-14-21">
                      7-14-21 Days (Longer Timeframe)
                    </option>
                    <option value="2-3-4">2-3-4 Days (Quick Follow-up)</option>
                    <option value="5-10-15">
                      5-10-15 Days (Moderate Pace)
                    </option>
                    <option value="custom">Custom Timing</option>
                  </select>
                </div>

                {/* Custom Timing (conditional) */}
                {localFormData.emailFrequency === "custom" && (
                  <div className="col-span-2">
                    <label
                      htmlFor="customEmailFrequency"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Custom Timing Description
                    </label>
                    <input
                      type="text"
                      id="customEmailFrequency"
                      name="customEmailFrequency"
                      value={localFormData.customEmailFrequency || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., 'First email immediately, then 2 days, then 1 week'"
                      required={localFormData.emailFrequency === "custom"}
                    />
                  </div>
                )}

                {/* Target Audience */}
                <div className="col-span-2">
                  <label
                    htmlFor="targetAudience"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Target Audience
                  </label>
                  <input
                    type="text"
                    id="targetAudience"
                    name="targetAudience"
                    value={localFormData.targetAudience}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Home sellers, First-time buyers, Open house attendees"
                    required
                  />
                </div>

                {/* Initial Contact Context */}
                <div className="col-span-2">
                  <label
                    htmlFor="initialContactContext"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Initial Contact Context
                  </label>
                  <textarea
                    id="initialContactContext"
                    name="initialContactContext"
                    value={localFormData.initialContactContext}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe how and when you first connected with this audience (website form, open house, referral, etc.)"
                    required
                  />
                </div>

                {/* Sequence Goals */}
                <div className="col-span-2">
                  <label
                    htmlFor="sequenceGoals"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sequence Goals
                  </label>
                  <textarea
                    id="sequenceGoals"
                    name="sequenceGoals"
                    value={localFormData.sequenceGoals || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="What do you want to achieve with this email sequence? (e.g., schedule a call, get a listing appointment, show more properties)"
                    required
                  />
                </div>

                {/* Value Proposition */}
                <div className="col-span-2">
                  <label
                    htmlFor="valueProposition"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Value Proposition
                  </label>
                  <textarea
                    id="valueProposition"
                    name="valueProposition"
                    value={localFormData.valueProposition || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="What unique value can you offer throughout this sequence? (market insights, property recommendations, expertise, etc.)"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="text-md font-medium text-blue-800 mb-2">
                  About Follow-Up Sequences
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  This tool will generate a complete series of follow-up emails
                  designed to nurture leads over time. Each email in the
                  sequence will:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 mb-2 space-y-1">
                  <li>Build upon the previous communication</li>
                  <li>Provide increasing value to the recipient</li>
                  <li>Guide prospects toward your desired outcome</li>
                  <li>Include appropriate calls-to-action</li>
                </ul>
                <p className="text-sm text-blue-700">
                  The sequence will progress from relationship building to
                  gentle urgency in a natural, professional way.
                </p>
              </div>
            </div>
          </Tab.Panel>

          {/* Transactional Email Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Line */}
                <div className="col-span-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject Line
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={localFormData.subject}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter an attention-grabbing subject line"
                    required
                  />
                </div>

                {/* Transaction Type */}
                <div>
                  <label
                    htmlFor="transactionType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Transaction Type
                  </label>
                  <select
                    id="transactionType"
                    name="transactionType"
                    value={
                      isOtherTransactionType
                        ? "other"
                        : localFormData.transactionType
                    }
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="welcome">Welcome/Sign-up</option>
                    <option value="open-house">Open House Registration</option>
                    <option value="listing-alert">New Listing Alert</option>
                    <option value="appointment">
                      Appointment Confirmation
                    </option>
                    <option value="other">Other (Custom)</option>
                  </select>
                </div>

                {isOtherTransactionType && (
                  <div className="mt-2">
                    <input
                      type="text"
                      id="customTransactionType"
                      name="customTransactionType"
                      value={localFormData.customTransactionType || ""}
                      onChange={handleInputChange}
                      placeholder="Enter custom transaction type"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                )}

                {/* User Name */}
                <div>
                  <label
                    htmlFor="userName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={localFormData.userName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., [First Name] or leave blank for dynamic insertion"
                  />
                </div>
              </div>

              {/* Conditional fields based on transaction type */}
              {localFormData.transactionType === "welcome" && (
                <div>
                  <label
                    htmlFor="companyInfo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company/Service Information
                  </label>
                  <textarea
                    id="companyInfo"
                    name="companyInfo"
                    value={localFormData.companyInfo}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe your company, services, or what the user signed up for"
                    required
                  />
                </div>
              )}

              {localFormData.transactionType === "open-house" && (
                <div>
                  <label
                    htmlFor="openHouseDetails"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Open House Details
                  </label>
                  <textarea
                    id="openHouseDetails"
                    name="openHouseDetails"
                    value={localFormData.openHouseDetails}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Provide details about the open house (address, date, time, special instructions)"
                    required
                  />
                </div>
              )}

              {localFormData.transactionType === "listing-alert" && (
                <div>
                  <label
                    htmlFor="propertyDetails"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Property Details
                  </label>
                  <textarea
                    id="propertyDetails"
                    name="propertyDetails"
                    value={localFormData.propertyDetails}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe the property (address, price, key features)"
                    required
                  />
                </div>
              )}

              {localFormData.transactionType === "appointment" && (
                <div>
                  <label
                    htmlFor="appointmentDetails"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Appointment Details
                  </label>
                  <textarea
                    id="appointmentDetails"
                    name="appointmentDetails"
                    value={localFormData.appointmentDetails}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Provide details about the appointment (date, time, location, purpose)"
                    required
                  />
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Common customization section */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Agent Information & Customization
        </h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="agentName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Agent Name
            </label>
            <input
              type="text"
              id="agentName"
              name="agentName"
              value={localFormData.agentName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Your name as you want it to appear"
            />
          </div>
          <div>
            <label
              htmlFor="agentTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Agent Title
            </label>
            <input
              type="text"
              id="agentTitle"
              name="agentTitle"
              value={localFormData.agentTitle}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. Realtor®, Broker, Luxury Home Specialist"
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor="companyInfo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Brokerage/Company Information
            </label>
            <textarea
              id="companyInfo"
              name="companyInfo"
              value={localFormData.companyInfo}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Your brokerage name, address, and any license numbers or disclaimers"
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor="callToAction"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Call to Action
            </label>
            <input
              type="text"
              id="callToAction"
              name="callToAction"
              value={localFormData.callToAction}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. Call me today, Visit our website, Schedule a showing"
            />
          </div>
          <div className="col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="includeTestimonial"
                  name="includeTestimonial"
                  type="checkbox"
                  checked={localFormData.includeTestimonial}
                  onChange={handleInputChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="includeTestimonial"
                  className="text-sm font-medium text-gray-700"
                >
                  Include a testimonial
                </label>
              </div>
            </div>
          </div>
          {localFormData.includeTestimonial && (
            <div className="col-span-2">
              <label
                htmlFor="testimonialText"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Testimonial Text
              </label>
              <textarea
                id="testimonialText"
                name="testimonialText"
                value={localFormData.testimonialText}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Copy and paste a client testimonial here"
                required={localFormData.includeTestimonial}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="tone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Tone
        </label>
        <select
          id="tone"
          name="tone"
          value={isOtherTone ? "other" : localFormData.tone}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        >
          <option value="professional">Professional</option>
          <option value="friendly">Friendly & Approachable</option>
          <option value="formal">Formal</option>
          <option value="urgent">Urgent & Exciting</option>
          <option value="informative">Informative & Educational</option>
          <option value="luxurious">Luxurious & High-End</option>
          <option value="personal">Personal & Warm</option>
          <option value="other">Other (Custom)</option>
        </select>
      </div>

      {isOtherTone && (
        <div className="mt-2">
          <input
            type="text"
            id="customTone"
            name="customTone"
            value={localFormData.customTone || ""}
            onChange={handleInputChange}
            placeholder="Enter custom tone"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isGenerating}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Email"}
        </button>
      </div>
    </form>
  );
}
