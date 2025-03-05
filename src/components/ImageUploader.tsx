import React, { useState } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

interface ImageUploaderProps {
  onUploadComplete?: (url: string) => void;
  buttonLabel?: string;
  pathPrefix?: string;
  showPreview?: boolean;
  className?: string;
  skipAuthCheck?: boolean;
}

export default function ImageUploader({
  onUploadComplete,
  buttonLabel = "Upload Image",
  pathPrefix = "uploads/",
  showPreview = false,
  className = "",
  skipAuthCheck = false,
}: ImageUploaderProps) {
  const { user } = useSupabaseAuth();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Skip auth check if skipAuthCheck is true or user exists
  const isAuthenticated = skipAuthCheck || !!user;

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError(null);

      if (!isAuthenticated) {
        setError("You must be logged in to upload images");
        return;
      }

      if (!event.target.files || event.target.files.length === 0) {
        setError("You must select an image to upload");
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${pathPrefix}${fileName}`;

      setUploading(true);

      // Upload file to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Set the image URL
      setImageUrl(publicUrl);

      // Call onUploadComplete callback if provided
      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }
    } catch (error: any) {
      console.error("Error uploading image:", error.message);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`${className}`}>
      {!isAuthenticated && !skipAuthCheck ? (
        <p className="text-red-500 mb-4">
          You must be logged in to upload images
        </p>
      ) : (
        <>
          <div className="mb-4">
            <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded cursor-pointer transition-colors">
              {uploading ? "Uploading..." : buttonLabel}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={uploadImage}
                disabled={uploading}
              />
            </label>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {showPreview && imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="relative h-40 w-full max-w-md rounded-md overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Uploaded image preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
