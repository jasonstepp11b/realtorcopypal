"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  addDocument,
  getDocuments,
  deleteDocument,
  saveGeneratedContent,
  checkUsageLimit,
} from "@/lib/firebase/firebaseUtils";
import StorageTest from "../components/StorageTest";

export default function TestFirebase() {
  const { user, signInWithEmail, signUpWithEmail, signOut, isEmailVerified } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testData, setTestData] = useState<any[]>([]);
  const [testContent, setTestContent] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [contentType, setContentType] = useState("property-listing");
  const [usageStats, setUsageStats] = useState<any>(null);

  // Fetch test data when user changes
  useEffect(() => {
    if (user) {
      fetchTestData();
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName);
        setSuccess("Account created successfully! Please verify your email.");
      } else {
        await signInWithEmail(email, password);
        setSuccess("Signed in successfully!");
      }
    } catch (error: any) {
      setError(error.message || "Authentication failed");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setSuccess("Signed out successfully!");
    } catch (error: any) {
      setError(error.message || "Sign out failed");
    }
  };

  const addTestData = async () => {
    if (!user) return;

    try {
      setError(null);
      const data = {
        content: testContent,
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };

      await addDocument("test-collection", data);
      setSuccess("Test data added successfully!");
      setTestContent("");
      fetchTestData();
    } catch (error: any) {
      setError(error.message || "Failed to add test data");
    }
  };

  const fetchTestData = async () => {
    if (!user) return;

    try {
      const data = await getDocuments("test-collection", user.uid);
      setTestData(data);
    } catch (error: any) {
      setError(error.message || "Failed to fetch test data");
    }
  };

  const deleteTestData = async (id: string) => {
    try {
      await deleteDocument("test-collection", id);
      setSuccess("Test data deleted successfully!");
      fetchTestData();
    } catch (error: any) {
      setError(error.message || "Failed to delete test data");
    }
  };

  // Function to test saveGeneratedContent
  const handleSaveContent = async () => {
    if (!user) return;

    try {
      setError(null);

      // Create metadata based on content type
      let metadata = {};

      if (contentType === "property-listing") {
        metadata = {
          propertyDetails: {
            propertyType: "Test Property",
            targetBuyer: "Test Buyer",
            tone: "Professional",
          },
        };
      } else if (contentType === "social-media") {
        metadata = {
          socialMediaDetails: {
            platform: "Instagram",
            contentType: "New Listing",
            tone: "Casual",
          },
        };
      } else if (contentType === "email-campaign") {
        metadata = {
          emailDetails: {
            emailType: "New Listing Alert",
            subject: "Test Email Subject",
            tone: "Professional",
          },
        };
      }

      // Save the generated content
      const result = await saveGeneratedContent(
        user.uid,
        contentType,
        generatedContent,
        metadata
      );

      setSuccess(`Content saved successfully with ID: ${result.id}`);
      setGeneratedContent("");

      // Refresh usage stats
      fetchUsageStats();
    } catch (error: any) {
      setError(error.message || "Failed to save generated content");
    }
  };

  // Function to fetch usage stats
  const fetchUsageStats = async () => {
    if (!user) return;

    try {
      const stats = await checkUsageLimit(user.uid);
      setUsageStats(stats);
    } catch (error: any) {
      console.error("Error fetching usage stats:", error);
    }
  };

  // Fetch usage stats when user changes
  useEffect(() => {
    if (user) {
      fetchUsageStats();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Firebase Test Page
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {user ? "Current User" : "Authentication"}
            </h2>

            {user ? (
              <div>
                <p className="mb-2">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Display Name:</span>{" "}
                  {user.displayName || "Not set"}
                </p>
                <p className="mb-2">
                  <span className="font-medium">User ID:</span> {user.uid}
                </p>
                <p className="mb-4">
                  <span className="font-medium">Email Verified:</span>{" "}
                  {isEmailVerified() ? "Yes" : "No"}
                </p>

                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuth}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                      required
                    />
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                      required
                    />
                  </label>
                </div>

                {isSignUp && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Display Name
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        required
                      />
                    </label>
                  </div>
                )}

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isSignUp"
                    checked={isSignUp}
                    onChange={() => setIsSignUp(!isSignUp)}
                    className="mr-2"
                  />
                  <label htmlFor="isSignUp" className="text-gray-700">
                    {isSignUp ? "Sign Up" : "Switch to Sign Up"}
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {isSignUp ? "Sign Up" : "Sign In"}
                </button>
              </form>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Firestore Test
            </h2>

            {user ? (
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Test Content
                    <textarea
                      value={testContent}
                      onChange={(e) => setTestContent(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                      rows={3}
                    />
                  </label>
                </div>

                <button
                  onClick={addTestData}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
                >
                  Add Test Data
                </button>

                <h3 className="font-medium mb-2 text-gray-900">
                  Your Test Data:
                </h3>

                {testData.length === 0 ? (
                  <p className="text-gray-500">No test data found.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {testData.map((item) => (
                      <li key={item.id} className="py-3">
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-700">
                            {item.content}
                          </p>
                          <button
                            onClick={() => deleteTestData(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Please sign in to test Firestore.</p>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        {user && usageStats && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Usage Statistics
            </h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Generations Used</span>
                <span>
                  {usageStats.currentUsage} / {usageStats.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    usageStats.percentUsed < 70
                      ? "bg-green-600"
                      : usageStats.percentUsed < 90
                      ? "bg-yellow-400"
                      : "bg-red-600"
                  }`}
                  style={{ width: `${usageStats.percentUsed}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Can generate more content: {usageStats.canGenerate ? "Yes" : "No"}
            </p>
          </div>
        )}

        {/* Content Generation Test */}
        {user && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Content Generation Test
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Content Type
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                >
                  <option value="property-listing">Property Listing</option>
                  <option value="social-media">Social Media</option>
                  <option value="email-campaign">Email Campaign</option>
                </select>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Generated Content
                <textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  rows={5}
                  placeholder="Enter some content to save..."
                />
              </label>
            </div>

            <button
              onClick={handleSaveContent}
              disabled={!generatedContent}
              className={`px-4 py-2 rounded ${
                !generatedContent
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Save Generated Content
            </button>
          </div>
        )}

        {/* Storage Test Component */}
        <StorageTest />
      </div>
    </div>
  );
}
