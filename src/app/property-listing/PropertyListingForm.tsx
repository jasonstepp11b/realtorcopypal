"use client";

import { useState, FormEvent, useEffect, useRef, useMemo } from "react";
import Image from "next/image";

interface PropertyListingFormProps {
  formData: {
    propertyType: string;
    bedrooms: string;
    bathrooms: string;
    squareFeet: string;
    features: string;
    sellingPoints: string;
    targetBuyer: string;
    tone: string;
    customTone?: string;
    askingPrice: string;
    hoaFees: string;
    propertyImage?: string; // Base64 encoded image
  };
  onSubmit: (data: PropertyListingFormProps["formData"]) => void;
  isGenerating: boolean;
}

export default function PropertyListingForm({
  formData,
  onSubmit,
  isGenerating,
}: PropertyListingFormProps) {
  const [localFormData, setLocalFormData] = useState(formData);
  const [isOtherPropertyType, setIsOtherPropertyType] = useState(false);
  const [customPropertyType, setCustomPropertyType] = useState("");
  const [isOtherTone, setIsOtherTone] = useState(false);
  const [customTone, setCustomTone] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(
    formData.propertyImage || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Property type options
  const propertyTypes = useMemo(
    () => [
      "Single-family home",
      "Condo",
      "Townhouse",
      "Multi-family home",
      "Apartment",
      "Luxury home",
      "Vacation home",
      "Ranch",
      "Land",
      "Commercial",
      "Industrial",
      "Tiny home",
      "Mobile home",
      "Penthouse",
      "Loft",
      "Other",
    ],
    []
  );

  // Tone options
  const toneOptions = useMemo(
    () => [
      "professional",
      "friendly",
      "luxury",
      "urgent",
      "enthusiastic",
      "Other",
    ],
    []
  );

  // Check if the initial property type and tone are not in our lists
  useEffect(() => {
    if (
      formData.propertyType &&
      !propertyTypes.includes(formData.propertyType)
    ) {
      setIsOtherPropertyType(true);
      setCustomPropertyType(formData.propertyType);
    }

    if (formData.tone && !toneOptions.includes(formData.tone.toLowerCase())) {
      setIsOtherTone(true);
      setCustomTone(formData.tone);
      setLocalFormData((prev) => ({
        ...prev,
        tone: "Other",
        customTone: formData.tone,
      }));
    }
  }, [formData.propertyType, formData.tone, propertyTypes, toneOptions]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for property type
    if (name === "propertyType") {
      if (value === "Other") {
        setIsOtherPropertyType(true);
        // Don't update the form data yet, wait for custom input
      } else {
        setIsOtherPropertyType(false);
        setLocalFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
    // Special handling for tone
    else if (name === "tone") {
      if (value === "Other") {
        setIsOtherTone(true);
      } else {
        setIsOtherTone(false);
        setLocalFormData((prev) => ({
          ...prev,
          tone: value,
          customTone: "",
        }));
      }
    } else {
      setLocalFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle changes to the custom property type input
  const handleCustomPropertyTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setCustomPropertyType(value);
    setLocalFormData((prev) => ({
      ...prev,
      propertyType: value,
    }));
  };

  // Handle changes to the custom tone input
  const handleCustomToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCustomTone(value);
    setLocalFormData((prev) => ({
      ...prev,
      customTone: value,
    }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setLocalFormData((prev) => ({
        ...prev,
        propertyImage: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setLocalFormData((prev) => {
      const newData = { ...prev };
      delete newData.propertyImage;
      return newData;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Prepare data for submission
    const submissionData = { ...localFormData };

    // If "Other" tone is selected, use the custom tone value
    if (isOtherTone && localFormData.customTone) {
      submissionData.tone = localFormData.customTone;
    }

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="propertyType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Property Type*
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={isOtherPropertyType ? "Other" : localFormData.propertyType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            required
          >
            <option value="">Select a property type</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {isOtherPropertyType && (
            <div className="mt-2">
              <input
                type="text"
                id="customPropertyType"
                name="customPropertyType"
                value={customPropertyType}
                onChange={handleCustomPropertyTypeChange}
                placeholder="Enter property type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                required
              />
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500">
            The type of property you&apos;re listing
          </p>
        </div>

        {/* Property Image Upload */}
        <div>
          <label
            htmlFor="propertyImage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Property Image
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              id="propertyImage"
              name="propertyImage"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <label
              htmlFor="propertyImage"
              className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Upload Image
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
          {imagePreview && (
            <div className="mt-3 relative w-full h-40">
              <Image
                src={imagePreview}
                alt="Property preview"
                fill
                className="rounded-md object-cover"
              />
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Upload an image of the property (optional, max 5MB)
          </p>
        </div>

        <div>
          <label
            htmlFor="targetBuyer"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Target Buyer*
          </label>
          <input
            type="text"
            id="targetBuyer"
            name="targetBuyer"
            value={localFormData.targetBuyer}
            onChange={handleChange}
            placeholder="e.g., Young families, First-time buyers, Luxury buyers"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Who is the ideal buyer for this property?
          </p>
        </div>

        <div>
          <label
            htmlFor="askingPrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Asking Price
          </label>
          <input
            type="text"
            id="askingPrice"
            name="askingPrice"
            value={localFormData.askingPrice}
            onChange={handleChange}
            placeholder="e.g., $450,000, $1.2M"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
          <p className="mt-1 text-xs text-gray-500">
            The listing price of the property
          </p>
        </div>

        <div>
          <label
            htmlFor="hoaFees"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            HOA Fees
          </label>
          <input
            type="text"
            id="hoaFees"
            name="hoaFees"
            value={localFormData.hoaFees}
            onChange={handleChange}
            placeholder="e.g., $250/month, $400/quarter"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
          <p className="mt-1 text-xs text-gray-500">
            Any HOA or maintenance fees (if applicable)
          </p>
        </div>

        <div>
          <label
            htmlFor="bedrooms"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bedrooms
          </label>
          <input
            type="text"
            id="bedrooms"
            name="bedrooms"
            value={localFormData.bedrooms}
            onChange={handleChange}
            placeholder="e.g., 3, 4, 5+"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>

        <div>
          <label
            htmlFor="bathrooms"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bathrooms
          </label>
          <input
            type="text"
            id="bathrooms"
            name="bathrooms"
            value={localFormData.bathrooms}
            onChange={handleChange}
            placeholder="e.g., 2, 2.5, 3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>

        <div>
          <label
            htmlFor="squareFeet"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Square Feet
          </label>
          <input
            type="text"
            id="squareFeet"
            name="squareFeet"
            value={localFormData.squareFeet}
            onChange={handleChange}
            placeholder="e.g., 1500, 2000, 3000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>

        <div>
          <label
            htmlFor="tone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tone*
          </label>
          <select
            id="tone"
            name="tone"
            value={isOtherTone ? "Other" : localFormData.tone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            required
          >
            <option value="">Select a tone</option>
            {toneOptions.map((tone) => (
              <option key={tone} value={tone}>
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </option>
            ))}
          </select>

          {isOtherTone && (
            <div className="mt-2">
              <input
                type="text"
                id="customTone"
                name="customTone"
                value={customTone}
                onChange={handleCustomToneChange}
                placeholder="Enter custom tone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                required
              />
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500">
            The tone of voice for your listing
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="features"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Key Features*
        </label>
        <textarea
          id="features"
          name="features"
          value={localFormData.features}
          onChange={handleChange}
          rows={3}
          placeholder="e.g., Hardwood floors, Granite countertops, Stainless steel appliances"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          required
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">
          List the main features of the property (comma separated)
        </p>
      </div>

      <div className="mt-6">
        <label
          htmlFor="sellingPoints"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Unique Selling Points*
        </label>
        <textarea
          id="sellingPoints"
          name="sellingPoints"
          value={localFormData.sellingPoints}
          onChange={handleChange}
          rows={3}
          placeholder="e.g., Walking distance to schools, Recently renovated kitchen, Large backyard"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          required
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">
          What makes this property special? (comma separated)
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isGenerating}
          className={`px-6 py-3 rounded-md text-white font-medium ${
            isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Generate Listings
        </button>
      </div>
    </form>
  );
}
