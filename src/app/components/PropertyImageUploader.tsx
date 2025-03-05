"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";
import ImageDisplay from "./ImageDisplay";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";

interface PropertyImageUploaderProps {
  /** Property ID to organize images */
  propertyId: string;
  /** Initial image URLs (if editing) */
  initialImages?: string[];
  /** Maximum number of images allowed */
  maxImages?: number;
  /** Callback when images are updated */
  onImagesUpdated?: (imageUrls: string[]) => void;
  /** CSS class for the container */
  className?: string;
}

export default function PropertyImageUploader({
  propertyId,
  initialImages = [],
  maxImages = 10,
  onImagesUpdated,
  className = "",
}: PropertyImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleImageUploaded = (imageUrl: string) => {
    // Add the new image to the array
    const updatedImages = [...images, imageUrl];
    setImages(updatedImages);

    // Call the callback
    if (onImagesUpdated) {
      onImagesUpdated(updatedImages);
    }
  };

  const handleError = (error: Error) => {
    setError(error.message);
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);

    // Call the callback
    if (onImagesUpdated) {
      onImagesUpdated(updatedImages);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-lg font-medium">Property Images</h3>

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
          Error: {error}
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video relative rounded-md overflow-hidden border border-gray-200">
                <ImageDisplay
                  src={imageUrl}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="w-full h-full"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
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
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages ? (
        <ImageUploader
          buttonLabel={
            images.length === 0 ? "Add Property Images" : "Add More Images"
          }
          pathPrefix={`properties/${propertyId}/`}
          onImageUploaded={handleImageUploaded}
          onError={handleError}
          showPreview={false}
        />
      ) : (
        <p className="text-amber-600 text-sm">
          Maximum number of images reached ({maxImages})
        </p>
      )}

      <p className="text-sm text-gray-500">
        {images.length} of {maxImages} images uploaded
      </p>
    </div>
  );
}
