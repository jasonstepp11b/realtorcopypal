"use client";

import { useState } from "react";
import Link from "next/link";

export default function DirectTest() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  const testImage = async () => {
    if (!imageUrl) {
      setError("Please enter an image URL");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Test if the image is accessible via direct URL
      const response = await fetch(imageUrl, { method: "HEAD" });
      console.log("Image test response:", response.status, response.statusText);

      if (response.ok) {
        setSuccess(`Image is accessible! Status: ${response.status}`);
      } else {
        setError(
          `Image is not accessible. Status: ${response.status} ${response.statusText}`
        );
      }
    } catch (error: any) {
      console.error("Error testing image URL:", error);
      setError(`Error testing image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Direct Image Test</h1>

      <div className="mb-4">
        <Link href="/test-storage" className="text-blue-600 hover:underline">
          ← Back to Test Storage
        </Link>
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
          Enter Supabase Image URL
        </label>
        <input
          type="text"
          value={imageUrl}
          onChange={handleUrlChange}
          placeholder="https://ttfovktdbgtwrhrigxyu.supabase.co/storage/v1/object/public/property-images/..."
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={testImage}
          disabled={loading || !imageUrl}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Image URL"}
        </button>
      </div>

      {imageUrl && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Direct Image Test:</h2>

          <div className="border border-gray-200 rounded-md p-4">
            <p className="mb-4 text-sm text-gray-500">
              This is a direct HTML img tag (not using Next.js Image):
            </p>

            <img
              src={imageUrl}
              alt="Direct test"
              className="max-w-full h-auto max-h-64 mx-auto"
              onError={(e) => {
                console.error("Image failed to load");
                e.currentTarget.style.display = "none";
                setError("Image failed to load in direct HTML img tag");
              }}
              onLoad={() => {
                console.log("Image loaded successfully");
                setSuccess("Image loaded successfully in direct HTML img tag");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
