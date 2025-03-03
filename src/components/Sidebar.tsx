"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useSupabaseAuth";
import { useState } from "react";
import Image from "next/image";
import RecentProjects from "./RecentProjects";

// Icons
import {
  HomeIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  EnvelopeIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BookmarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Updated navigation with Properties as the main focus
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Properties", href: "/projects", icon: BuildingOffice2Icon },
    { name: "My Saved Content", href: "/my-content", icon: BookmarkIcon },
  ];

  // Tools navigation - moved to a separate section
  const toolsNavigation = [
    {
      name: "Property Listings",
      href: "/property-listing",
      icon: BuildingOffice2Icon,
    },
    { name: "Social Media", href: "/social-media", icon: DocumentTextIcon },
    { name: "Email Campaigns", href: "/email-campaign", icon: EnvelopeIcon },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full bg-gray-900 overflow-y-auto">
          <div className="flex items-center justify-between h-16 px-4">
            <span className="text-xl font-bold text-white">RealtorCopyPal</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-white"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {renderSidebarContent()}
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:block md:flex-shrink-0">
        <div className="h-full w-64 bg-gray-900">
          <div className="flex items-center h-16 px-4">
            <span className="text-xl font-bold text-white">RealtorCopyPal</span>
          </div>
          {renderSidebarContent()}
        </div>
      </div>
    </>
  );

  function renderSidebarContent() {
    return (
      <>
        <div className="mt-5 flex flex-col flex-1">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href)
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}

            {/* Create Property button */}
            <Link
              href="/projects/new"
              className="group flex items-center px-4 py-3 mt-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              <PlusIcon
                className="mr-3 h-5 w-5 text-white"
                aria-hidden="true"
              />
              Create Property
            </Link>

            {/* Recent Projects component */}
            <RecentProjects />

            {/* Tools section */}
            <div className="mt-8 pt-4 border-t border-gray-700">
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Content Tools
              </h3>
              <div className="mt-2 space-y-1">
                {toolsNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href)
                          ? "text-white"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        <div className="px-2 pb-4">
          <div className="border-t border-gray-700 pt-4 mt-4">
            <Link
              href="/settings"
              className="group flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
              Settings
            </Link>

            {user ? (
              <div className="mt-3 px-4">
                <div className="flex items-center">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="mt-3 flex w-full items-center px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="mt-3 flex w-full items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </>
    );
  }
}
