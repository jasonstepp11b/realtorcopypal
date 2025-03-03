"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/firebase/firebaseUtils";
import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";

export default function StorageTest() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileType(selectedFile.type);
      setError(null);
      setUploadUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    try {
      setUploading(true);
      setError(null);

      // Create a path for the file in Firebase Storage
      const path = `test-uploads/${user.uid}/${Date.now()}_${file.name}`;

      // Upload the file and get the download URL
      const url = await uploadFile(file, path);

      setUploadUrl(url);
    } catch (error: any) {
      setError(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Storage Test
        </h2>
        <p className="text-gray-500">
          Please sign in to test Firebase Storage.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Storage Test</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          Select a file to upload
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 text-gray-700"
          />
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`px-4 py-2 rounded ${
          !file || uploading
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>

      {uploadUrl && (
        <div className="mt-4">
          <h3 className="font-medium mb-2 text-gray-900">Upload Successful!</h3>

          <div className="bg-gray-100 p-3 rounded break-all mb-4">
            <p className="text-sm text-gray-700">{uploadUrl}</p>
            <p className="text-xs text-gray-500 mt-1">
              Note: This URL requires authentication to access directly in a
              browser.
            </p>
          </div>

          {/* Display the uploaded file based on its type */}
          <div className="mt-4">
            <h4 className="font-medium mb-2 text-gray-900">
              Uploaded File Preview:
            </h4>

            {fileType?.startsWith("image/") ? (
              <div className="border border-gray-200 rounded p-2">
                <Image
                  src={uploadUrl}
                  alt="Uploaded image"
                  width={400}
                  height={300}
                  className="max-w-full h-auto max-h-64 rounded mx-auto object-contain"
                />
              </div>
            ) : fileType?.startsWith("video/") ? (
              <div className="border border-gray-200 rounded p-2">
                <video
                  controls
                  className="max-w-full h-auto max-h-64 rounded mx-auto"
                >
                  <source src={uploadUrl} type={fileType} />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : fileType?.startsWith("audio/") ? (
              <div className="border border-gray-200 rounded p-2">
                <audio controls className="w-full">
                  <source src={uploadUrl} type={fileType} />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            ) : (
              <div className="border border-gray-200 rounded p-4 text-center">
                <p className="text-gray-700">
                  File uploaded successfully. This file type (
                  {fileType || "unknown"}) cannot be previewed.
                </p>
                <a
                  href={uploadUrl}
                  className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download File (requires authentication)
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
