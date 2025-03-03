import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PropertyProject } from "@/lib/supabase/supabaseUtils";

interface ProjectFormProps {
  project?: Partial<PropertyProject>;
  onSubmit: (data: Partial<PropertyProject>) => Promise<void>;
  isSubmitting: boolean;
}

export default function ProjectForm({
  project,
  onSubmit,
  isSubmitting,
}: ProjectFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<PropertyProject>>(
    project || {
      name: "",
      address: "",
      property_type: "Single-family home",
      bedrooms: "",
      bathrooms: "",
      square_feet: "",
      listing_price: "",
      features: "",
      selling_points: "",
      target_buyer: "",
      neighborhood_highlights: "",
      image_url: "",
    }
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    formData.image_url || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOtherPropertyType, setIsOtherPropertyType] = useState(false);
  const [customPropertyType, setCustomPropertyType] = useState("");

  // Common property types for the dropdown
  const propertyTypes = [
    "Single-family home",
    "Condo",
    "Townhouse",
    "Multi-family home",
    "Apartment",
    "Luxury home",
    "Vacation home",
    "Ranch",
    "Tiny home",
    "Mobile home",
    "Penthouse",
    "Loft",
    "Other",
  ];

  // Check if the initial property type is not in our list
  useEffect(() => {
    if (
      formData.property_type &&
      !propertyTypes.includes(formData.property_type)
    ) {
      setIsOtherPropertyType(true);
      setCustomPropertyType(formData.property_type);
    }
  }, [formData.property_type, propertyTypes]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for property type
    if (name === "property_type") {
      if (value === "Other") {
        setIsOtherPropertyType(true);
      } else {
        setIsOtherPropertyType(false);
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCustomPropertyTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomPropertyType(e.target.value);
    setFormData((prev) => ({
      ...prev,
      property_type: e.target.value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({
          ...prev,
          image_url: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      image_url: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Property Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Basic information about the property project.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Property Address
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="property_type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Property Type
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={isOtherPropertyType ? "Other" : formData.property_type}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {isOtherPropertyType && (
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="customPropertyType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Custom Property Type
                  </label>
                  <input
                    type="text"
                    id="customPropertyType"
                    value={customPropertyType}
                    onChange={handleCustomPropertyTypeChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              )}

              <div className="col-span-6 sm:col-span-2">
                <label
                  htmlFor="bedrooms"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bedrooms
                </label>
                <input
                  type="text"
                  name="bedrooms"
                  id="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label
                  htmlFor="bathrooms"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bathrooms
                </label>
                <input
                  type="text"
                  name="bathrooms"
                  id="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label
                  htmlFor="square_feet"
                  className="block text-sm font-medium text-gray-700"
                >
                  Square Feet
                </label>
                <input
                  type="text"
                  name="square_feet"
                  id="square_feet"
                  value={formData.square_feet}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="listing_price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Listing Price
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    name="listing_price"
                    id="listing_price"
                    value={formData.listing_price}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Property Details
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Additional information to help generate better content.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <label
                  htmlFor="features"
                  className="block text-sm font-medium text-gray-700"
                >
                  Key Features
                </label>
                <textarea
                  id="features"
                  name="features"
                  rows={3}
                  value={formData.features}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Hardwood floors, granite countertops, etc."
                />
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="selling_points"
                  className="block text-sm font-medium text-gray-700"
                >
                  Unique Selling Points
                </label>
                <textarea
                  id="selling_points"
                  name="selling_points"
                  rows={3}
                  value={formData.selling_points}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Recently renovated, close to schools, etc."
                />
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="target_buyer"
                  className="block text-sm font-medium text-gray-700"
                >
                  Target Buyer
                </label>
                <input
                  type="text"
                  name="target_buyer"
                  id="target_buyer"
                  value={formData.target_buyer}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="First-time homebuyers, retirees, etc."
                />
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="neighborhood_highlights"
                  className="block text-sm font-medium text-gray-700"
                >
                  Neighborhood Highlights
                </label>
                <textarea
                  id="neighborhood_highlights"
                  name="neighborhood_highlights"
                  rows={3}
                  value={formData.neighborhood_highlights}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Great schools, parks nearby, shopping centers, etc."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Property Image
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload an image of the property.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {imagePreview ? (
                  <div className="space-y-1 text-center">
                    <div className="relative h-40 w-full">
                      <Image
                        src={imagePreview}
                        alt="Property preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex justify-center mt-4">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  );
}
