"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  generatorType?: "property-listing" | "social-media" | "email-campaign";
}

export default function LoadingOverlay({
  isLoading,
  message = "Generating amazing content for you...",
  generatorType = "property-listing",
}: LoadingOverlayProps) {
  const [loadingStep, setLoadingStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(isLoading);

  // Reset state when isLoading changes
  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setLoadingStep(0);
      setTipIndex(0);
    } else {
      // Add a small delay before hiding to ensure smooth transitions
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Loading steps messages based on generator type
  const loadingSteps = useMemo(
    () => ({
      "property-listing": [
        "Analyzing property details...",
        "Identifying key selling points...",
        "Crafting compelling descriptions...",
        "Optimizing for your target audience...",
        "Finalizing your property listings...",
      ],
      "social-media": [
        "Analyzing your real estate content...",
        "Crafting engaging social posts...",
        "Optimizing for platform visibility...",
        "Adding relevant hashtags...",
        "Finalizing your social media content...",
      ],
      "email-campaign": [
        "Analyzing your campaign goals...",
        "Crafting compelling email content...",
        "Optimizing subject lines...",
        "Personalizing for your audience...",
        "Finalizing your email campaign...",
      ],
    }),
    []
  );

  // Tips based on generator type
  const tips = useMemo(
    () => ({
      "property-listing": [
        "High-quality photos can increase engagement by up to 94%",
        "Highlighting neighborhood amenities can attract more qualified buyers",
        "Virtual tours can increase interest in your property by 87%",
        "Properties with detailed descriptions sell 20% faster",
        "Mentioning energy-efficient features appeals to eco-conscious buyers",
      ],
      "social-media": [
        "Posts with images get 2.3x more engagement than those without",
        "The best times to post real estate content are Tuesdays and Thursdays",
        "Using 3-5 relevant hashtags can increase reach by 40%",
        "Video tours get 403% more inquiries than listings without videos",
        "Sharing client testimonials builds trust with potential clients",
      ],
      "email-campaign": [
        "Personalized subject lines increase open rates by 26%",
        "The best time to send real estate emails is Tuesday at 10 AM",
        "Including a clear call-to-action increases click-through rates by 371%",
        "Segmenting your email list can improve conversion rates by 760%",
        "Mobile-optimized emails are crucial as 61% of emails are opened on mobile",
      ],
    }),
    []
  );

  // Cycle through loading steps
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < loadingSteps[generatorType].length - 1 ? prev + 1 : prev
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible, generatorType, loadingSteps]);

  // Cycle through tips
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips[generatorType].length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, generatorType, tips]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Loading animation */}
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            {generatorType === "property-listing" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
            )}
            {generatorType === "social-media" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
            )}
            {generatorType === "email-campaign" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Main message */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {message}
          </h3>

          {/* Loading step */}
          <p className="text-blue-600 dark:text-blue-400 font-medium mb-6">
            {loadingSteps[generatorType][loadingStep]}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${
                  (loadingStep + 1) * (100 / loadingSteps[generatorType].length)
                }%`,
              }}
            ></div>
          </div>

          {/* Tip box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 w-full">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Pro Tip
                </h4>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  {tips[generatorType][tipIndex]}
                </p>
              </div>
            </div>
          </div>

          {/* Ad space placeholder - can be implemented later */}
          {/* <div className="mt-6 w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Ad space - Premium features available with RealtorCopyPal Pro
          </div> */}
        </div>
      </div>
    </div>
  );
}
