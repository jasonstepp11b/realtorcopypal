"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { addDocument, getDocuments } from "@/lib/firebase/firebaseUtils";

export default function TestFirebase() {
  const { user, userProfile, loading, signInWithGoogle } = useAuth();
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestWrite = async () => {
    if (!user) {
      setTestError("You must be signed in to test Firebase write operations");
      return;
    }

    try {
      setTestError(null);
      setTestResult(null);

      // Test writing to Firestore
      const result = await addDocument("test-collection", {
        userId: user.uid,
        message: testMessage || "Test message",
        timestamp: new Date().toISOString(),
      });

      setTestResult({
        operation: "write",
        success: true,
        documentId: result.id,
      });
    } catch (error) {
      console.error("Firebase write test failed:", error);
      setTestError(
        `Write test failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleTestRead = async () => {
    if (!user) {
      setTestError("You must be signed in to test Firebase read operations");
      return;
    }

    try {
      setTestError(null);
      setTestResult(null);

      // Test reading from Firestore
      const documents = await getDocuments("test-collection", user.uid);

      setTestResult({
        operation: "read",
        success: true,
        count: documents?.length || 0,
        data: documents,
      });
    } catch (error) {
      console.error("Firebase read test failed:", error);
      setTestError(
        `Read test failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Firebase Test Page</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        {loading ? (
          <p>Loading authentication status...</p>
        ) : user ? (
          <div>
            <p className="text-green-600 font-medium">✓ Authenticated</p>
            <div className="mt-2 p-4 bg-gray-50 rounded-md">
              <p>
                <span className="font-medium">User ID:</span> {user.uid}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Display Name:</span>{" "}
                {user.displayName}
              </p>
            </div>

            {userProfile && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">User Profile</h3>
                <div className="p-4 bg-gray-50 rounded-md">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(userProfile, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-yellow-600 mb-4">Not authenticated</p>
            <button
              onClick={signInWithGoogle}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      {user && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Test Firestore Operations
          </h2>

          <div className="mb-4">
            <label
              htmlFor="testMessage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Test Message
            </label>
            <input
              type="text"
              id="testMessage"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a test message"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleTestWrite}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Test Write
            </button>
            <button
              onClick={handleTestRead}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Test Read
            </button>
          </div>

          {testError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
              <p className="text-red-600">{testError}</p>
            </div>
          )}

          {testResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">
                {testResult.operation === "write"
                  ? "Write Operation"
                  : "Read Operation"}{" "}
                Successful
              </h3>
              <div className="bg-white p-3 rounded-md">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
