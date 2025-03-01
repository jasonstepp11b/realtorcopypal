"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateUserProfile } from "@/lib/firebase/firebaseUtils";
import {
  UserCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  CreditCardIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();
  const { user, userProfile, loading, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in");
    }

    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user, loading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      await updateUserProfile(user.uid, {
        displayName,
      });

      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            User Profile
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your account information and subscription
          </p>
        </div>

        {error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mx-4 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-24 w-24 rounded-full"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserCircleIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="flex-1">
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Display Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="displayName"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user.displayName || "");
                    }}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {user.displayName || "User"}
                </h2>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                  {user.email}
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Account Information
            </h3>

            <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <KeyIcon className="h-5 w-5 mr-1 text-gray-400" />
                  Account Type
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.providerData[0]?.providerId === "google.com"
                    ? "Google Account"
                    : "Email & Password"}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <ArrowPathIcon className="h-5 w-5 mr-1 text-gray-400" />
                  Generations Used
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {userProfile?.generationCount || 0} generations
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-1 text-gray-400" />
                  Subscription Plan
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">
                        {userProfile?.subscription?.plan === "free"
                          ? "Free Plan"
                          : userProfile?.subscription?.plan === "starter"
                          ? "Starter Plan"
                          : userProfile?.subscription?.plan === "professional"
                          ? "Professional Plan"
                          : userProfile?.subscription?.plan === "team"
                          ? "Team Plan"
                          : "Free Plan"}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {userProfile?.subscription?.status || "Active"}
                      </span>
                    </div>
                    <Link
                      href="/pricing"
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Upgrade Plan
                    </Link>
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Security Settings
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <Link
                  href="/auth/change-password"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  Change Password
                </Link>
              </div>

              <div>
                <button
                  onClick={signOut}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
