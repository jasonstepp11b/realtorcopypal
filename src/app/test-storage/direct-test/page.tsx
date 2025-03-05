"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getSignedUrl,
  getPublicUrl,
  extractFilePathFromUrl,
} from "@/lib/supabase/storageUtils";

export default function DirectTest() {
  const searchParams = useSearchParams();
  const [imageUrl, setImageUrl] = useState<string>(
    searchParams?.get("url") || ""
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [responseDetails, setResponseDetails] = useState<string | null>(null);
  const [isSignedUrl, setIsSignedUrl] = useState<boolean>(false);
  const [isGeneratingSignedUrl, setIsGeneratingSignedUrl] =
    useState<boolean>(false);
  const [filePath, setFilePath] = useState<string | null>(null);

  // If URL is provided in query params, test it automatically
  useEffect(() => {
    const urlFromParams = searchParams?.get("url");
    if (urlFromParams) {
      setImageUrl(urlFromParams);
      testImage(urlFromParams);

      try {
        const extractedPath = extractFilePathFromUrl(urlFromParams);
        setFilePath(extractedPath);
      } catch (error) {
        console.error("Could not extract file path from URL:", error);
      }
    }
  }, [searchParams]);

  const testImage = async (url: string = imageUrl) => {
    if (!url) {
      setError("Please enter an image URL");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setImageLoaded(false);
    setImageLoadError(false);
    setResponseDetails(null);
    setIsSignedUrl(url.includes("token="));

    try {
      // Try to extract file path if not already set
      if (!filePath) {
        try {
          const extractedPath = extractFilePathFromUrl(url);
          setFilePath(extractedPath);
        } catch (error) {
          console.error("Could not extract file path from URL:", error);
        }
      }

      // Test with fetch HEAD request first
      const response = await fetch(url, { method: "HEAD" });

      // Collect all headers for debugging
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const details = [
        `Status: ${response.status} ${response.statusText}`,
        `Content-Type: ${headers["content-type"] || "Not provided"}`,
        `Content-Length: ${headers["content-length"] || "Not provided"}`,
        `CORS: ${headers["access-control-allow-origin"] || "Not provided"}`,
        `Cache-Control: ${headers["cache-control"] || "Not provided"}`,
        `Server: ${headers["server"] || "Not provided"}`,
      ].join("\n");

      setResponseDetails(details);

      if (response.ok) {
        setSuccess("Image URL is accessible via fetch!");
      } else {
        setError(
          `Image URL returned status ${response.status} ${response.statusText}`
        );
      }
    } catch (fetchError: any) {
      setError(`Fetch error: ${fetchError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageLoadError(false);
    if (!success) {
      setSuccess("Image loaded successfully with HTML img tag!");
    }
  };

  const handleImageError = () => {
    setImageLoadError(true);
    setImageLoaded(false);
    if (!error) {
      setError("Image failed to load with HTML img tag");
    }
  };

  const tryGenerateSignedUrl = async () => {
    if (!filePath) {
      setError(
        "Could not extract file path from URL. Cannot generate signed URL."
      );
      return;
    }

    try {
      setIsGeneratingSignedUrl(true);
      setError(null);

      // Get a signed URL for the file
      const signedUrl = await getSignedUrl(filePath);
      setImageUrl(signedUrl);
      setIsSignedUrl(true);
      testImage(signedUrl);
      setSuccess("Generated signed URL successfully!");
    } catch (error: any) {
      setError(`Failed to generate signed URL: ${error.message}`);
    } finally {
      setIsGeneratingSignedUrl(false);
    }
  };

  const tryRegeneratePublicUrl = () => {
    if (!filePath) {
      setError(
        "Could not extract file path from URL. Cannot generate public URL."
      );
      return;
    }

    try {
      const publicUrl = getPublicUrl(filePath);
      setImageUrl(publicUrl);
      setIsSignedUrl(false);
      testImage(publicUrl);
      setSuccess("Generated public URL successfully!");
    } catch (error: any) {
      setError(`Failed to generate public URL: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Direct Image URL Test</h1>

      <div className="mb-4">
        <Link href="/test-storage" className="text-blue-600 hover:underline">
          ← Back to Storage Test
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          This tool tests if an image URL is directly accessible without using
          Next.js Image component. It will attempt to fetch the image and
          display it using a regular HTML img tag.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL to test
        </label>
        <div className="flex">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => testImage()}
            disabled={loading || !imageUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test URL"}
          </button>
        </div>
      </div>

      {filePath && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded">
          <p>
            <strong>Extracted File Path:</strong> {filePath}
          </p>
        </div>
      )}

      <div className="mb-6 flex space-x-4">
        {filePath && !isSignedUrl && (
          <button
            onClick={tryGenerateSignedUrl}
            disabled={isGeneratingSignedUrl}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isGeneratingSignedUrl ? "Generating..." : "Try with Signed URL"}
          </button>
        )}

        {filePath && isSignedUrl && (
          <button
            onClick={tryRegeneratePublicUrl}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Try with Public URL
          </button>
        )}
      </div>

      {responseDetails && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-medium mb-2">Response Details:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {responseDetails}
          </pre>
        </div>
      )}

      {imageUrl && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Image Preview:</h2>

          <div className="relative border border-gray-200 rounded-md overflow-hidden p-4 bg-gray-50">
            {!imageLoaded && !imageLoadError && (
              <div className="text-center p-8 text-gray-500">
                Loading image...
              </div>
            )}

            {imageLoadError && (
              <div className="text-center p-8 text-red-500">
                Failed to load image with HTML img tag
              </div>
            )}

            <img
              src={imageUrl}
              alt="Test image"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`max-w-full max-h-96 mx-auto ${
                imageLoaded ? "block" : "hidden"
              }`}
            />
          </div>

          {imageLoadError && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
              <h3 className="font-medium mb-2">Troubleshooting:</h3>
              <ul className="list-disc ml-5">
                <li className="mb-1">
                  Check if the URL is correct and points to an actual image file
                </li>
                <li className="mb-1">
                  Verify that the Supabase Storage bucket has the correct
                  policies:
                  <ul className="list-disc ml-5 mt-1">
                    <li>
                      For public access, add a policy with <code>SELECT</code>{" "}
                      permission for <code>anon</code> role
                    </li>
                    <li>
                      SQL expression should be{" "}
                      <code>(bucket_id = &apos;property-images&apos;)</code> or{" "}
                      <code>true</code> for testing
                    </li>
                  </ul>
                </li>
                <li className="mb-1">
                  {isSignedUrl
                    ? "The signed URL might have expired - try generating a new one"
                    : "Try using a signed URL instead of a public URL"}
                </li>
                <li className="mb-1">
                  Check CORS settings in Supabase Storage
                </li>
                <li>Try opening the URL directly in a browser tab</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
