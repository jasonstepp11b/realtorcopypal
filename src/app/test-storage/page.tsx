"use client";

import { useState, useEffect } from "react";
import {
  uploadImage,
  deleteImage,
  checkBucketAccess,
} from "@/lib/supabase/storageUtils";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

// The bucket name in Supabase
const DEFAULT_BUCKET = "property-images";

export default function TestStorage() {
  const { user, session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  const [imageError, setImageError] = useState<boolean>(false);
  const [bucketStatus, setBucketStatus] = useState<string | null>(null);
  const [bucketDetails, setBucketDetails] = useState<string | null>(null);
  const [isCreatingBucket, setIsCreatingBucket] = useState<boolean>(false);
  const [directUploadStatus, setDirectUploadStatus] = useState<string | null>(
    null
  );
  const [troubleshootingOpen, setTroubleshootingOpen] = useState(false);

  // Check bucket access and authentication status on load
  useEffect(() => {
    checkBucketStatus();
  }, []);

  const checkBucketStatus = async () => {
    try {
      setBucketStatus("Checking bucket access...");
      setBucketDetails(null);

      const hasAccess = await checkBucketAccess();

      if (hasAccess) {
        setBucketStatus("✅ Storage bucket is accessible");
      } else {
        setBucketStatus("❌ Storage bucket is not accessible");

        // Check if we can list buckets to provide more info
        const supabase = createClientComponentClient();
        const { data, error } = await supabase.storage.listBuckets();

        if (error) {
          setBucketDetails(`Error: ${error.message}`);
        } else if (!data || data.length === 0) {
          setBucketDetails("No storage buckets found in this project.");
        } else {
          const bucketNames = data.map((b) => b.name).join(", ");
          const hasBucket = data.some((b) => b.name === DEFAULT_BUCKET);

          if (hasBucket) {
            setBucketDetails(
              `Bucket "${DEFAULT_BUCKET}" exists but is not accessible. Check bucket policies.`
            );
          } else {
            setBucketDetails(
              `Bucket "${DEFAULT_BUCKET}" does not exist. Available buckets: ${bucketNames}`
            );
          }
        }
      }
    } catch (error: any) {
      setBucketStatus("❌ Error checking storage bucket access");
      setBucketDetails(error.message);
    }
  };

  // Create the bucket if it doesn't exist
  const createBucket = async () => {
    try {
      setIsCreatingBucket(true);
      setError(null);
      setSuccess(null);

      const supabase = createClientComponentClient();
      const { data, error } = await supabase.storage.createBucket(
        DEFAULT_BUCKET,
        {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        }
      );

      if (error) {
        setError(`Failed to create bucket: ${error.message}`);
      } else {
        setSuccess(`Bucket "${DEFAULT_BUCKET}" created successfully!`);
        // Check bucket status again
        await checkBucketStatus();
      }
    } catch (error: any) {
      setError(`Error creating bucket: ${error.message}`);
    } finally {
      setIsCreatingBucket(false);
    }
  };

  // Update authentication status whenever user or session changes
  useEffect(() => {
    if (user && session) {
      setAuthStatus(`Authenticated as: ${user.email}`);
    } else {
      setAuthStatus("Not authenticated. Please sign in.");
    }
  }, [user, session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      setImageError(false);

      // Upload the image to Supabase Storage
      const url = await uploadImage(file);

      setImageUrl(url);
      setSuccess("Image uploaded successfully!");

      // No need to test accessibility since we're using signed URLs
      // which are guaranteed to work for authenticated users
    } catch (error: any) {
      console.error("Upload error details:", error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Direct upload function that bypasses our utility functions
  const handleDirectUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      setImageError(false);
      setDirectUploadStatus("Starting direct upload...");

      // Create a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      console.log(`Attempting direct upload to ${DEFAULT_BUCKET}/${fileName}`);

      // Use Supabase client directly
      const supabase = createClientComponentClient();

      // Check if bucket exists and try to create it if it doesn't
      setDirectUploadStatus("Checking bucket existence...");
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === DEFAULT_BUCKET);

        if (!bucketExists) {
          console.log(
            `Bucket "${DEFAULT_BUCKET}" not found, attempting to create it...`
          );
          setDirectUploadStatus("Creating bucket...");
          const { error: createError } = await supabase.storage.createBucket(
            DEFAULT_BUCKET,
            {
              public: true, // Make the bucket public
            }
          );

          if (createError) {
            console.error(
              `Failed to create bucket "${DEFAULT_BUCKET}":`,
              createError
            );
            setDirectUploadStatus("Failed to create bucket");
          } else {
            console.log(`Successfully created bucket "${DEFAULT_BUCKET}"`);
            setDirectUploadStatus("Bucket created successfully");
          }
        }
      } catch (bucketError) {
        console.warn("Error checking/creating bucket:", bucketError);
        // Continue anyway, the upload might still work
      }

      setDirectUploadStatus("Uploading file to Supabase...");

      // Upload the file
      const { data, error } = await supabase.storage
        .from(DEFAULT_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        console.error("Direct upload error:", error);
        setDirectUploadStatus("Upload failed");
        throw new Error(`Direct upload failed: ${error.message}`);
      }

      console.log("File uploaded successfully");
      setDirectUploadStatus("File uploaded, waiting for processing...");

      // Add a small delay to ensure the file is processed by Supabase
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get the direct Supabase URL for Next.js Image compatibility
      const { data: publicUrlData } = supabase.storage
        .from(DEFAULT_BUCKET)
        .getPublicUrl(fileName);

      if (publicUrlData && publicUrlData.publicUrl) {
        console.log(
          "Using direct Supabase URL for Next.js Image compatibility"
        );
        setDirectUploadStatus("Upload complete");
        setImageUrl(publicUrlData.publicUrl);
        setSuccess("Image uploaded successfully via direct upload!");
        return;
      }

      // Use our proxy API to avoid CORS issues - only if direct URL fails
      const origin = window.location.origin;
      const proxyUrl = `${origin}/api/supabase-proxy?path=${encodeURIComponent(
        fileName
      )}&bucket=${encodeURIComponent(DEFAULT_BUCKET)}`;
      console.log(`Generated proxy URL for direct upload: ${proxyUrl}`);
      setDirectUploadStatus("Upload complete");
      setImageUrl(proxyUrl);
      setSuccess("Image uploaded successfully via direct upload!");
      return;
    } catch (error: any) {
      console.error("Direct upload error details:", error);
      setError(`Direct upload failed: ${error.message}`);
      setDirectUploadStatus("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!imageUrl) {
      setError("No image to delete");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      // Delete the image from Supabase Storage
      await deleteImage(imageUrl);

      setImageUrl(null);
      setSuccess("Image deleted successfully!");
      setImageError(false);
    } catch (error: any) {
      setError(`Delete failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Function to open the image in a new tab
  const openImageInNewTab = () => {
    if (imageUrl) {
      window.open(imageUrl, "_blank");
    }
  };

  // Function to copy the image URL to clipboard
  const copyImageUrl = () => {
    if (imageUrl) {
      navigator.clipboard
        .writeText(imageUrl)
        .then(() => {
          setSuccess("Image URL copied to clipboard!");
          setTimeout(() => setSuccess(null), 3000);
        })
        .catch((err) => {
          setError("Failed to copy URL: " + err.message);
        });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Storage Test</h1>

      {/* Bucket Status Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Bucket Status</h2>
        <div className="flex gap-4">
          <button
            onClick={checkBucketStatus}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            disabled={uploading}
          >
            Check Bucket Status
          </button>
          <button
            onClick={createBucket}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            disabled={uploading}
          >
            Create Bucket
          </button>
        </div>
        {bucketStatus && (
          <div className="mt-2 p-3 bg-gray-100 rounded">
            <p>{bucketStatus}</p>
          </div>
        )}
      </div>

      {/* File Upload Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={uploading}
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            disabled={!file || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            onClick={handleDirectUpload}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            disabled={!file || uploading}
          >
            Direct Upload
          </button>
        </div>

        {directUploadStatus && (
          <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded">
            <p>Status: {directUploadStatus}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
            <p className="font-medium">Error:</p>
            <p>{error}</p>

            {error.includes("Bucket not found") && (
              <div className="mt-2">
                <p className="font-medium">Possible solutions:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Click the "Create Bucket" button above</li>
                  <li>Check if you have permission to create buckets</li>
                  <li>Verify your Supabase credentials are correct</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded">
            <p>{success}</p>
          </div>
        )}
      </div>

      {/* Image Display Section */}
      {imageUrl && (
        <div className="mt-4 border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold mb-2">Uploaded Image</h3>

          {imageUrl.includes("/api/supabase-proxy") ? (
            // For proxy URLs, use a regular img tag to avoid Next.js Image restrictions
            <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
              <img
                src={imageUrl}
                alt="Uploaded image"
                className="object-contain w-full h-full"
                onError={() => setImageError(true)}
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90">
                  <div className="text-center p-4">
                    <p className="text-red-500 font-medium">
                      Image Loading Error
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      The image was uploaded but cannot be displayed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // For other URLs, use Next.js Image component
            <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
              <Image
                src={imageUrl}
                alt="Uploaded image"
                fill
                className="object-contain"
                onError={() => setImageError(true)}
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90">
                  <div className="text-center p-4">
                    <p className="text-red-500 font-medium">
                      Image Loading Error
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      The image was uploaded but cannot be displayed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700">
              {imageUrl.includes("/api/supabase-proxy")
                ? "Proxy URL (handled by server):"
                : imageUrl.includes("signedUrl")
                ? "Signed URL (expires in 7 days):"
                : "Public URL:"}
            </p>
            <div className="flex mt-1">
              <input
                type="text"
                value={imageUrl}
                readOnly
                className="flex-1 p-2 text-sm border rounded-l-md bg-gray-50"
              />
              <button
                onClick={copyImageUrl}
                className="bg-blue-100 text-blue-700 px-3 rounded-r-md border border-l-0 hover:bg-blue-200"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex space-x-2 mt-3">
            <button
              onClick={openImageInNewTab}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
              Open in New Tab
            </button>
            <button
              onClick={handleDelete}
              className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Delete Image
            </button>
          </div>
        </div>
      )}

      {/* Direct Test Link */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Troubleshooting Tools</h2>
        <Link
          href="/test-storage/direct-test"
          className="text-blue-600 hover:underline flex items-center"
        >
          Go to Direct URL Test Tool
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
        <p className="text-sm text-gray-600 mt-1">
          Use this tool to test image URLs directly without the Next.js Image
          component
        </p>
      </div>
    </div>
  );
}
