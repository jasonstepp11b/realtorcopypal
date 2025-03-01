"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getDocuments, deleteDocument } from "@/lib/firebase/firebaseUtils";
import Link from "next/link";
import {
  ChartBarIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ReactNode } from "react";
import UsageStats from "../components/UsageStats";

interface SavedListing {
  id: string;
  content: string;
  propertyDetails?: {
    propertyType?: string;
    targetBuyer?: string;
    tone?: string;
  };
  emailDetails?: {
    emailType?: string;
    subject?: string;
    tone?: string;
  };
  socialMediaDetails?: {
    platform?: string;
    contentType?: string;
    tone?: string;
  };
  createdAt: string;
  type: string;
}

// Mock data for development
const mockListings: SavedListing[] = [
  {
    id: "mock-listing-1",
    content:
      "Stunning 3-bedroom home with modern finishes, open floor plan, and a spacious backyard perfect for entertaining. This property features hardwood floors, stainless steel appliances, and a recently renovated kitchen. Located in a family-friendly neighborhood with excellent schools nearby.",
    propertyDetails: {
      propertyType: "Single Family Home",
      targetBuyer: "Families",
      tone: "Professional",
    },
    createdAt: new Date().toISOString(),
    type: "property-listing",
  },
  {
    id: "mock-listing-2",
    content:
      "Just listed! Luxury condo in downtown with breathtaking city views. Perfect for young professionals who want to be in the heart of the action. #RealEstate #LuxuryLiving #CityViews",
    socialMediaDetails: {
      platform: "Instagram",
      contentType: "New Listing",
      tone: "Casual",
    },
    createdAt: new Date().toISOString(),
    type: "social-media",
  },
  {
    id: "mock-listing-3",
    content:
      "Subject: Your Dream Home Awaits: New Listing Alert!\n\nDear [Client Name],\n\nI'm excited to share a new property that just hit the market that matches your criteria. This stunning 4-bedroom colonial has everything you've been looking for, including a renovated kitchen and private backyard.\n\nLet me know if you'd like to schedule a viewing this weekend.\n\nBest regards,\n[Your Name]",
    emailDetails: {
      emailType: "New Listing Alert",
      subject: "Your Dream Home Awaits: New Listing Alert!",
      tone: "Professional",
    },
    createdAt: new Date().toISOString(),
    type: "email-campaign",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, userProfile, isEmailVerified, resendVerificationEmail } =
    useAuth();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (user) {
      fetchListings();
    } else {
      // Use mock data for development or when not signed in
      setSavedListings(mockListings);
      setIsLoading(false);
    }
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const listings = await getDocuments("listings", user.uid);

      // If no listings returned from Firebase, use mock data
      if (!listings || listings.length === 0) {
        setSavedListings(mockListings);
      } else {
        setSavedListings(listings as SavedListing[]);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      // Use mock data if there's an error
      setSavedListings(mockListings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      await deleteDocument("listings", id);
      setSavedListings((prev) => prev.filter((listing) => listing.id !== id));
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  const filteredListings = savedListings
    .filter((listing) => {
      // Filter by tab
      if (activeTab !== "all" && listing.type !== activeTab) {
        return false;
      }

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          listing.content.toLowerCase().includes(searchLower) ||
          listing.propertyDetails?.propertyType
            ?.toLowerCase()
            .includes(searchLower) ||
          listing.emailDetails?.subject?.toLowerCase().includes(searchLower) ||
          listing.socialMediaDetails?.platform
            ?.toLowerCase()
            .includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleResendVerification = async () => {
    try {
      setVerificationError(null);
      await resendVerificationEmail();
      setVerificationSent(true);
    } catch (error) {
      setVerificationError(
        "Failed to send verification email. Please try again later."
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {user && !isEmailVerified() && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon
                className="h-5 w-5 text-yellow-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please verify your email address to ensure full access to all
                features.
                {verificationSent ? (
                  <span className="font-medium ml-1">
                    Verification email sent!
                  </span>
                ) : (
                  <button
                    onClick={handleResendVerification}
                    className="font-medium ml-1 text-yellow-700 underline hover:text-yellow-600"
                  >
                    Resend verification email
                  </button>
                )}
              </p>
              {verificationError && (
                <p className="mt-1 text-sm text-red-600">{verificationError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back{user?.displayName ? `, ${user.displayName}` : ""}! Create
          and manage your real estate marketing content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Property Listings"
          description="Create compelling property descriptions"
          icon={<BuildingOffice2Icon className="h-8 w-8" />}
          href="/property-listing"
          count={
            savedListings.filter((l) => l.type === "property-listing").length
          }
          color="blue"
        />
        <DashboardCard
          title="Social Media Posts"
          description="Generate engaging social media content"
          icon={<DocumentTextIcon className="h-8 w-8" />}
          href="/social-media"
          count={savedListings.filter((l) => l.type === "social-media").length}
          color="purple"
        />
        <DashboardCard
          title="Email Campaigns"
          description="Create effective email marketing"
          icon={<EnvelopeIcon className="h-8 w-8" />}
          href="/email-campaign"
          count={
            savedListings.filter((l) => l.type === "email-campaign").length
          }
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Saved Content
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your saved marketing content
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center">
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                  }
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                >
                  {sortOrder === "desc" ? (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  )}
                  Date
                </button>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search content..."
                    className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "all"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("property-listing")}
                  className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "property-listing"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Property Listings
                </button>
                <button
                  onClick={() => setActiveTab("social-media")}
                  className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "social-media"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Social Media
                </button>
                <button
                  onClick={() => setActiveTab("email-campaign")}
                  className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "email-campaign"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Email Campaigns
                </button>
              </nav>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-gray-500">Loading your content...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "No content matches your search."
                    : "You don't have any saved content yet."}
                </p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href="/property-listing"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Property Listing
                  </Link>
                  <Link
                    href="/social-media"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Create Social Media Post
                  </Link>
                  <Link
                    href="/email-campaign"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Create Email Campaign
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div className="mb-2 md:mb-0">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              listing.type === "property-listing"
                                ? "bg-blue-100 text-blue-800"
                                : listing.type === "social-media"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            } mr-2`}
                          >
                            {listing.type === "property-listing"
                              ? "Property Listing"
                              : listing.type === "social-media"
                              ? "Social Media"
                              : "Email Campaign"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="mt-1 text-lg font-medium text-gray-900">
                          {listing.type === "property-listing"
                            ? listing.propertyDetails?.propertyType ||
                              "Property Listing"
                            : listing.type === "social-media"
                            ? `${
                                listing.socialMediaDetails?.platform ||
                                "Social Media"
                              } - ${
                                listing.socialMediaDetails?.contentType ||
                                "Post"
                              }`
                            : listing.emailDetails?.subject || "Email Campaign"}
                        </h3>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap">
                      {listing.content}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {listing.propertyDetails?.propertyType && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {listing.propertyDetails.propertyType}
                        </span>
                      )}
                      {listing.propertyDetails?.targetBuyer && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          For: {listing.propertyDetails.targetBuyer}
                        </span>
                      )}
                      {listing.socialMediaDetails?.platform && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {listing.socialMediaDetails.platform}
                        </span>
                      )}
                      {listing.emailDetails?.emailType && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {listing.emailDetails.emailType}
                        </span>
                      )}
                      {(listing.propertyDetails?.tone ||
                        listing.socialMediaDetails?.tone ||
                        listing.emailDetails?.tone) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Tone:{" "}
                          {listing.propertyDetails?.tone ||
                            listing.socialMediaDetails?.tone ||
                            listing.emailDetails?.tone}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <UsageStats />
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  count: number;
  color: "blue" | "purple" | "green";
}

function DashboardCard({
  title,
  description,
  icon,
  href,
  count,
  color,
}: DashboardCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    purple: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    green: "bg-green-50 border-green-200 hover:bg-green-100",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
  };

  return (
    <Link
      href={href}
      className={`block rounded-lg border p-6 transition-colors ${colorClasses[color]}`}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${iconColorClasses[color]}`}>{icon}</div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
          <div className="mt-4 flex items-center">
            <span className="text-2xl font-semibold text-gray-900">
              {count}
            </span>
            <span className="ml-2 text-sm text-gray-500">saved</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CreditCardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}
