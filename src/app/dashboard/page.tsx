"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import { getGenerations, deleteGeneration } from "@/lib/supabase/supabaseUtils";
import Link from "next/link";
import Image from "next/image";
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
  PlusIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { ReactNode } from "react";
import UsageStats from "../components/UsageStats";
import { getProjects, PropertyProject } from "@/lib/supabase/supabaseUtils";
import ImageUploader from "../components/ImageUploader";

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
  const { user, userProfile, loading } = useAuth();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [recentProjects, setRecentProjects] = useState<PropertyProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    // If auth is still loading, wait
    if (loading) return;

    // If user is not logged in, redirect to sign-in page
    if (!user && !loading) {
      router.push("/auth/sign-in");
      return;
    }

    if (user) {
      fetchListings();
      fetchRecentProjects();
    } else {
      // Use mock data for development or when not signed in
      setSavedListings(mockListings);
      setIsLoading(false);
    }
  }, [user, loading, router]);

  const fetchListings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Get generations from Supabase
      const listings = await getGenerations(user.id);

      // If no listings returned from Supabase, use mock data
      if (!listings || listings.length === 0) {
        setSavedListings(mockListings);
      } else {
        // Map Supabase generations to our SavedListing format
        const formattedListings = listings.map((gen) => ({
          id: gen.id,
          content: gen.content,
          // Parse any additional details from content if needed
          propertyDetails:
            gen.type === "property-listing"
              ? JSON.parse(gen.title || "{}")
              : undefined,
          emailDetails:
            gen.type === "email-campaign"
              ? JSON.parse(gen.title || "{}")
              : undefined,
          socialMediaDetails:
            gen.type === "social-media"
              ? JSON.parse(gen.title || "{}")
              : undefined,
          createdAt: gen.created_at,
          type: gen.type,
        }));
        setSavedListings(formattedListings);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      // Use mock data if there's an error
      setSavedListings(mockListings);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentProjects = async () => {
    if (!user) return;

    try {
      setIsLoadingProjects(true);
      const data = await getProjects(user.id);
      // Only use the first 3 projects
      setRecentProjects((data as PropertyProject[]).slice(0, 3));
    } catch (error) {
      console.error("Error fetching recent projects:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      await deleteGeneration(id);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="mt-12 flex justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to RealtorCopyPal
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Your AI-powered assistant for creating compelling real estate
            content
          </p>
        </div>

        {/* Property Projects Section */}
        <div className="bg-white shadow-sm rounded-lg px-6 py-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Property Projects
              </h2>
              <p className="mt-1 text-gray-600">
                Create and manage your property projects to generate content
                across multiple channels
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/projects"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Property
              </Link>
            </div>
          </div>

          {isLoadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-100 rounded-lg p-6"
                >
                  <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No properties yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first property project
              </p>
              <div className="mt-6">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Property
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                  >
                    <Link
                      href={`/projects/${project.id}`}
                      className="block mb-4"
                    >
                      {/* Property Image */}
                      {project.image_url && (
                        <div className="mb-3 w-full h-32 overflow-hidden rounded-md relative">
                          <Image
                            src={project.image_url}
                            alt={project.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <h3 className="text-lg font-medium text-gray-900 truncate hover:text-blue-600">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {project.address}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Type:</span>{" "}
                          {project.property_type}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> $
                          {project.listing_price}
                        </div>
                      </div>
                    </Link>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Link
                        href={`/property-listing?projectId=${project.id}`}
                        className="flex flex-col items-center px-2 py-2 text-sm text-gray-700 bg-white rounded-md hover:bg-gray-100 border border-gray-200"
                      >
                        <DocumentTextIcon className="h-5 w-5 text-blue-500 mb-1" />
                        <span>Listing</span>
                      </Link>

                      <Link
                        href={`/social-media?projectId=${project.id}`}
                        className="flex flex-col items-center px-2 py-2 text-sm text-gray-700 bg-white rounded-md hover:bg-gray-100 border border-gray-200"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500 mb-1" />
                        <span>Social</span>
                      </Link>

                      <Link
                        href={`/email-campaign?projectId=${project.id}`}
                        className="flex flex-col items-center px-2 py-2 text-sm text-gray-700 bg-white rounded-md hover:bg-gray-100 border border-gray-200"
                      >
                        <EnvelopeIcon className="h-5 w-5 text-green-500 mb-1" />
                        <span>Email</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/projects"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View all properties
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Content Generation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/property-listing"
            className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Property Listings
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create compelling property descriptions that highlight key
              features and appeal to your target buyers.
            </p>
          </Link>

          <Link
            href="/social-media"
            className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Social Media</h3>
            <p className="mt-2 text-sm text-gray-500">
              Generate engaging social media content to promote your listings
              and connect with potential buyers.
            </p>
          </Link>

          <Link
            href="/email-campaign"
            className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-4">
              <EnvelopeIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Email Campaigns
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create effective email campaigns to nurture leads, follow up with
              clients, and close more deals.
            </p>
          </Link>
        </div>

        {/* Example of using the ImageUploader component */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload Profile Image</h2>
          <p className="text-gray-600 mb-4">
            Upload a profile image to personalize your account. The image will
            be stored securely in Supabase.
          </p>
          <ImageUploader
            buttonLabel="Upload Profile Image"
            pathPrefix="profiles/"
            showPreview={true}
            className="mt-4"
            skipAuthCheck={true}
          />
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
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
  };

  return (
    <Link
      href={href}
      className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div className="p-6">
        <div className="flex items-center">
          <div
            className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]} text-white`}
          >
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{count}</p>
            <p className="ml-2 text-sm text-gray-500">saved items</p>
          </div>
        </div>
      </div>
      <div className={`h-1 ${colorClasses[color]}`}></div>
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
