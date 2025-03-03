"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { db } from "@/lib/firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  getFirestore,
} from "firebase/firestore";

export default function TestFirestore() {
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<string[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setError("Please sign in to test Firestore");
      return;
    }

    const runTests = async () => {
      try {
        setTestResult("Running Firestore tests...");

        // Test 1: Simple collection read
        try {
          setTestResult(
            "Test 1: Checking if generated-content collection exists..."
          );
          const simpleSnapshot = await getDocs(
            collection(db, "generated-content")
          );
          setTestResult(
            `Test 1 Result: Collection exists with ${simpleSnapshot.size} documents`
          );

          // Store documents for display
          const docs = simpleSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDocuments(docs);
        } catch (err) {
          setTestResult(
            `Test 1 Failed: ${err instanceof Error ? err.message : String(err)}`
          );
        }

        // Test 2: Try a different collection name
        try {
          setTestResult("Test 2: Checking if listings collection exists...");
          const listingsSnapshot = await getDocs(collection(db, "listings"));
          setTestResult(
            `Test 2 Result: 'listings' collection exists with ${listingsSnapshot.size} documents`
          );
        } catch (err) {
          setTestResult(
            `Test 2 Failed: ${err instanceof Error ? err.message : String(err)}`
          );
        }

        // Test 3: Try a simple query without orderBy
        try {
          setTestResult("Test 3: Testing simple query with where clause...");
          const simpleQuery = query(
            collection(db, "generated-content"),
            where("userId", "==", user.uid)
          );
          const querySnapshot = await getDocs(simpleQuery);
          setTestResult(
            `Test 3 Result: Query returned ${querySnapshot.size} documents`
          );
        } catch (err) {
          setTestResult(
            `Test 3 Failed: ${err instanceof Error ? err.message : String(err)}`
          );
        }

        // Test 4: Try the full query
        try {
          setTestResult("Test 4: Testing full query with where and orderBy...");
          const fullQuery = query(
            collection(db, "generated-content"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(fullQuery);
          setTestResult(
            `Test 4 Result: Full query returned ${querySnapshot.size} documents`
          );
        } catch (err) {
          setTestResult(
            `Test 4 Failed: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      } catch (err) {
        setError(
          `Test failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    };

    runTests();
  }, [user, loading]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Firestore Test Page</h1>

      {testResult && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Test Result:</h2>
          <pre className="whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Documents in generated-content:
        </h2>
        {documents.length === 0 ? (
          <p>No documents found</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 border rounded">
                <p className="font-medium">Document ID: {doc.id}</p>
                <pre className="mt-2 text-sm overflow-auto max-h-40">
                  {JSON.stringify(doc, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
