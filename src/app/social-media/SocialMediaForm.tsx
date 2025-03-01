"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import Image from "next/image";

interface SocialMediaFormProps {
  formData: {
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
    customCallToAction?: string;
    listingAgent: string;

    // Social media specific
    platform: string;
    customPlatform?: string;
    targetAudience: string;
    hashtags: string;

    // Style options
    tone: string;
    customTone?: string;
  };
  onSubmit: (data: SocialMediaFormProps["formData"]) => void;
  isGenerating: boolean;
}

export default function SocialMediaForm({
  formData,
  onSubmit,
  isGenerating,
}: SocialMediaFormProps) {
  const [localFormData, setLocalFormData] = useState(formData);
  const [imagePreview, setImagePreview] = useState<string | null>(
    formData.primaryPhoto || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOtherPropertyType, setIsOtherPropertyType] = useState(false);
  const [isOtherPlatform, setIsOtherPlatform] = useState(false);
  const [isOtherTone, setIsOtherTone] = useState(false);
  const [isOtherCallToAction, setIsOtherCallToAction] = useState(false);

  const propertyTypes = [
    "Single-family home",
    "Condo",
    "Townhouse",
    "Multi-family home",
    "Apartment",
    "Luxury home",
    "Vacation home",
    "Ranch",
    "Land",
    "Other",
  ];

  const platforms = [
    "Instagram",
    "Facebook",
    "Twitter",
    "LinkedIn",
    "Pinterest",
    "Other",
  ];

  const callToActions = [
    "Schedule a tour",
    "DM for details",
    "Visit our website",
    "Call now",
    "Book an appointment",
    "Join the open house",
    "Other",
  ];

  const tones = [
    "Professional",
    "Casual",
    "Luxury",
    "Friendly",
    "Enthusiastic",
    "Informative",
    "Other",
  ];

  // Check for initial values that might be "Other"
  useEffect(() => {
    if (formData.platform && !platforms.includes(formData.platform)) {
      setIsOtherPlatform(true);
      setLocalFormData((prev) => ({
        ...prev,
        customPlatform: formData.platform,
        platform: "Other",
      }));
    }

    if (formData.tone && !tones.includes(formData.tone)) {
      setIsOtherTone(true);
      setLocalFormData((prev) => ({
        ...prev,
        customTone: formData.tone,
        tone: "Other",
      }));
    }

    if (
      formData.callToAction &&
      !callToActions.includes(formData.callToAction)
    ) {
      setIsOtherCallToAction(true);
      setLocalFormData((prev) => ({
        ...prev,
        customCallToAction: formData.callToAction,
        callToAction: "Other",
      }));
    }

    if (
      formData.propertyType &&
      !propertyTypes.includes(formData.propertyType)
    ) {
      setIsOtherPropertyType(true);
    }
  }, [formData, platforms, tones, callToActions, propertyTypes]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setLocalFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      // Special handling for select fields with "Other" option
      if (name === "platform") {
        if (value === "Other") {
          setIsOtherPlatform(true);
        } else {
          setIsOtherPlatform(false);
          setLocalFormData((prev) => ({
            ...prev,
            customPlatform: "",
            platform: value,
          }));
        }
      } else if (name === "tone") {
        if (value === "Other") {
          setIsOtherTone(true);
        } else {
          setIsOtherTone(false);
          setLocalFormData((prev) => ({
            ...prev,
            customTone: "",
            tone: value,
          }));
        }
      } else if (name === "callToAction") {
        if (value === "Other") {
          setIsOtherCallToAction(true);
        } else {
          setIsOtherCallToAction(false);
          setLocalFormData((prev) => ({
            ...prev,
            customCallToAction: "",
            callToAction: value,
          }));
        }
      } else if (name === "propertyType") {
        if (value === "Other") {
          setIsOtherPropertyType(true);
        } else {
          setIsOtherPropertyType(false);
        }
      }

      // Standard field update
      setLocalFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle custom input fields for "Other" options
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "customPlatform") {
      setLocalFormData((prev) => ({
        ...prev,
        customPlatform: value,
      }));
    } else if (name === "customTone") {
      setLocalFormData((prev) => ({
        ...prev,
        customTone: value,
      }));
    } else if (name === "customCallToAction") {
      setLocalFormData((prev) => ({
        ...prev,
        customCallToAction: value,
      }));
    } else if (name === "customPropertyType") {
      setLocalFormData((prev) => ({
        ...prev,
        propertyType: value,
      }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setLocalFormData((prev) => ({
        ...prev,
        primaryPhoto: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Prepare data for submission
    const submissionData = { ...localFormData };

    // Set the actual values from custom fields if "Other" is selected
    if (isOtherPlatform && localFormData.customPlatform) {
      submissionData.platform = localFormData.customPlatform;
    }

    if (isOtherTone && localFormData.customTone) {
      submissionData.tone = localFormData.customTone;
    }

    if (isOtherCallToAction && localFormData.customCallToAction) {
      submissionData.callToAction = localFormData.customCallToAction;
    }

    onSubmit(submissionData);
  };

  // Determine if we should show platform-specific fields
  const showHashtags =
    localFormData.platform === "Instagram" ||
    localFormData.platform === "Twitter" ||
    localFormData.platform === "Pinterest";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property Information Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Property Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Property Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property Address*
            </label>
            <input
              type="text"
              name="propertyAddress"
              value={localFormData.propertyAddress}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="123 Main St, City, State"
            />
          </div>

          {/* Listing Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Listing Price*
            </label>
            <input
              type="text"
              name="listingPrice"
              value={localFormData.listingPrice}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="$500,000"
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property Type*
            </label>
            <select
              name="propertyType"
              value={isOtherPropertyType ? "Other" : localFormData.propertyType}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {isOtherPropertyType && (
              <input
                type="text"
                name="customPropertyType"
                value={localFormData.propertyType}
                onChange={handleCustomInputChange}
                placeholder="Enter property type"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            )}
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bedrooms*
            </label>
            <input
              type="number"
              name="bedrooms"
              value={localFormData.bedrooms}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bathrooms*
            </label>
            <input
              type="number"
              name="bathrooms"
              value={localFormData.bathrooms}
              onChange={handleChange}
              required
              min="0"
              step="0.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Square Feet */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Square Feet*
            </label>
            <input
              type="number"
              name="squareFeet"
              value={localFormData.squareFeet}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Property Image */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Property Image
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
                id="property-image"
              />
              <label
                htmlFor="property-image"
                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Image
              </label>
              {imagePreview && (
                <span className="ml-3 text-sm text-gray-500">
                  Image uploaded
                </span>
              )}
            </div>
            {imagePreview && (
              <div className="mt-2 relative h-40 w-full md:w-1/2 border border-gray-300 rounded-md overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Property preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setLocalFormData((prev) => ({
                      ...prev,
                      primaryPhoto: undefined,
                    }));
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Open House Information (Optional) */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Open House Information</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasOpenHouse"
              name="hasOpenHouse"
              checked={localFormData.hasOpenHouse}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="hasOpenHouse"
              className="ml-2 text-sm text-gray-700"
            >
              Include Open House
            </label>
          </div>
        </div>

        {localFormData.hasOpenHouse && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Open House Details
            </label>
            <textarea
              name="openHouseDetails"
              value={localFormData.openHouseDetails}
              onChange={handleChange}
              placeholder="e.g., Sunday, July 10th from 1-4pm"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Content and Platform Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Social Media Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Platform*
            </label>
            <select
              name="platform"
              value={isOtherPlatform ? "Other" : localFormData.platform}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select platform</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>

            {isOtherPlatform && (
              <input
                type="text"
                name="customPlatform"
                value={localFormData.customPlatform || ""}
                onChange={handleCustomInputChange}
                placeholder="Enter platform name"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            )}
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tone
            </label>
            <select
              name="tone"
              value={isOtherTone ? "Other" : localFormData.tone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select tone</option>
              {tones.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>

            {isOtherTone && (
              <input
                type="text"
                name="customTone"
                value={localFormData.customTone || ""}
                onChange={handleCustomInputChange}
                placeholder="Enter tone"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Audience
            </label>
            <input
              type="text"
              name="targetAudience"
              value={localFormData.targetAudience}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., First-time homebuyers, Investors"
            />
          </div>

          {/* Call to Action */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Call to Action
            </label>
            <select
              name="callToAction"
              value={isOtherCallToAction ? "Other" : localFormData.callToAction}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select call to action</option>
              {callToActions.map((cta) => (
                <option key={cta} value={cta}>
                  {cta}
                </option>
              ))}
            </select>

            {isOtherCallToAction && (
              <input
                type="text"
                name="customCallToAction"
                value={localFormData.customCallToAction || ""}
                onChange={handleCustomInputChange}
                placeholder="Enter call to action"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Listing Agent */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Listing Agent
            </label>
            <input
              type="text"
              name="listingAgent"
              value={localFormData.listingAgent}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., John Smith, 555-123-4567"
            />
          </div>

          {/* Hashtags - Only shown for relevant platforms */}
          {showHashtags && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hashtags
              </label>
              <input
                type="text"
                name="hashtags"
                value={localFormData.hashtags}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., #RealEstate #DreamHome"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Property Details</h2>

        {/* Key Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Key Features
          </label>
          <textarea
            name="keyFeatures"
            value={localFormData.keyFeatures}
            onChange={handleChange}
            placeholder="e.g., Renovated kitchen, hardwood floors, pool, spacious backyard"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
          <p className="mt-1 text-sm text-gray-500">
            Highlight the most attractive features of the property
          </p>
        </div>

        {/* Neighborhood Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Neighborhood Highlights
          </label>
          <textarea
            name="neighborhoodHighlights"
            value={localFormData.neighborhoodHighlights}
            onChange={handleChange}
            placeholder="e.g., Close to schools, shopping centers, parks"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={2}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isGenerating}
          className="btn btn-primary px-6"
        >
          {isGenerating ? "Generating..." : "Generate Social Media Posts"}
        </button>
      </div>
    </form>
  );
}
