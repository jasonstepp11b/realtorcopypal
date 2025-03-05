"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/supabase/storageUtils";
import dynamic from "next/dynamic";

// Create a safe auth hook that doesn't depend on Firebase being available
function useSafeAuth() {
  const [user, setUser] = useState<any>(null);
  const [authAvailable, setAuthAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Use a self-invoking async function to handle the dynamic import
      (async () => {
        try {
          // Try to dynamically import the auth module
          const authModule = await import("@/lib/hooks/useAuth").catch(
            () => null
          );

          if (authModule) {
            // If we successfully imported the module, try to use it
            try {
              const authContext = authModule.useAuth();
              setUser(authContext.user);
              setAuthAvailable(true);
            } catch (error) {
              console.warn("Auth context not available:", error);
            }
          }
        } catch (error) {
          console.warn("Auth module could not be loaded:", error);
        }
      })();
    }
  }, []);

  return { user, authAvailable };
}

interface ImageUploaderProps {
  /** Initial image URL (if editing) */
  initialImageUrl?: string;
  /** Callback when image is uploaded successfully */
  onImageUploaded?: (imageUrl: string) => void;
  /** Callback when image upload fails */
  onError?: (error: Error) => void;
  /** Custom path prefix for organizing files (e.g., "users/123/") */
  pathPrefix?: string;
  /** Label for the upload button */
  buttonLabel?: string;
  /** Whether to show the preview */
  showPreview?: boolean;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** CSS class for the container */
  className?: string;
  /** Skip authentication check (for testing or when auth is not available) */
  skipAuthCheck?: boolean;
}

export default function ImageUploader({
  initialImageUrl,
  onImageUploaded,
  onError,
  pathPrefix,
  buttonLabel = "Upload Image",
  showPreview = true,
  maxSizeMB = 5,
  className = "",
  skipAuthCheck = false,
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use our safe auth hook
  const { user, authAvailable } = useSafeAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      // Check if user is authenticated (unless skipAuthCheck is true)
      if (!skipAuthCheck && authAvailable && !user) {
        throw new Error("You must be logged in to upload images");
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        throw new Error(
          `Invalid file type: ${file.type}. Only images are allowed.`
        );
      }

      // Check file size
      const MAX_SIZE = maxSizeMB * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error(
          `File size exceeds limit of ${maxSizeMB}MB. Current size: ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB`
        );
      }

      // Determine path prefix
      let effectivePathPrefix = pathPrefix;
      if (!effectivePathPrefix && user?.uid) {
        effectivePathPrefix = `users/${user.uid}/`;
      } else if (!effectivePathPrefix) {
        effectivePathPrefix = "anonymous/";
      }

      // Upload the image
      const url = await uploadImage(file, "property-images", {
        pathPrefix: effectivePathPrefix,
      });

      // Update state
      setImageUrl(url);
      setUploadSuccess("Image uploaded successfully!");

      // Call the callback
      if (onImageUploaded) {
        onImageUploaded(url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setUploadError(errorMessage);

      // Call the error callback
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Upload button */}
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? "Uploading..." : buttonLabel}
      </button>

      {/* Status messages */}
      {uploadError && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
          Error: {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="text-green-500 text-sm bg-green-50 p-2 rounded-md">
          {uploadSuccess}
        </div>
      )}

      {/* Image preview */}
      {showPreview && imageUrl && (
        <div className="relative w-full aspect-video max-w-md border border-gray-200 rounded-md overflow-hidden">
          <Image
            src={imageUrl}
            alt="Uploaded image"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 400px"
            onError={() => {
              // Fallback to img tag if Next.js Image fails
              const imgElement = document.createElement("img");
              imgElement.src = imageUrl;
              imgElement.alt = "Uploaded image";
              imgElement.className = "w-full h-full object-cover";

              const container = document.getElementById(
                "image-preview-container"
              );
              if (container) {
                container.innerHTML = "";
                container.appendChild(imgElement);
              }
            }}
          />
          <div id="image-preview-container" className="absolute inset-0"></div>
        </div>
      )}
    </div>
  );
}
