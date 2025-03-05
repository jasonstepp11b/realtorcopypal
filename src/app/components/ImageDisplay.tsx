"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageDisplayProps {
  /** The URL of the image to display */
  src: string;
  /** Alt text for the image */
  alt: string;
  /** Width of the image in pixels (for Next.js Image) */
  width?: number;
  /** Height of the image in pixels (for Next.js Image) */
  height?: number;
  /** Whether to fill the container (for Next.js Image) */
  fill?: boolean;
  /** CSS class for the container */
  className?: string;
  /** Object fit style */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  /** Whether to show a placeholder while loading */
  showPlaceholder?: boolean;
  /** Whether to show a fallback image if the main image fails to load */
  showFallback?: boolean;
  /** URL of the fallback image */
  fallbackSrc?: string;
}

export default function ImageDisplay({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  objectFit = "cover",
  showPlaceholder = true,
  showFallback = true,
  fallbackSrc = "https://placehold.co/600x400?text=Image+Not+Available",
}: ImageDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useFallbackImg, setUseFallbackImg] = useState(false);

  // Check if the URL is a Supabase URL or a proxy URL
  const isSupabaseUrl =
    src.includes("supabase.co") && !src.includes("api/supabase-proxy");
  const isProxyUrl = src.includes("api/supabase-proxy");

  // Handle image load success
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setIsLoading(false);
    setError(true);

    // If Next.js Image fails, try using a regular img tag
    if (!useFallbackImg) {
      setUseFallbackImg(true);
    }
  };

  // Placeholder styles
  const placeholderClasses = "bg-gray-200 animate-pulse";

  // Container classes
  const containerClasses = `relative ${className}`;

  // If using a fallback image due to error
  if (error && showFallback && !useFallbackImg) {
    return (
      <div className={containerClasses}>
        <Image
          src={fallbackSrc}
          alt={`Fallback for ${alt}`}
          width={width || 600}
          height={height || 400}
          fill={fill}
          style={{ objectFit }}
          className={className}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }

  // If we need to use a regular img tag (for proxy URLs or after Next.js Image failed)
  if (useFallbackImg || isProxyUrl) {
    return (
      <div className={containerClasses}>
        {isLoading && showPlaceholder && (
          <div
            className={`absolute inset-0 ${placeholderClasses}`}
            aria-hidden="true"
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={error && showFallback ? fallbackSrc : src}
          alt={alt}
          className={`${fill ? "w-full h-full" : ""} ${className}`}
          style={{ objectFit }}
          onLoad={handleImageLoad}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />
      </div>
    );
  }

  // Default: Use Next.js Image for Supabase URLs
  return (
    <div className={containerClasses}>
      {isLoading && showPlaceholder && (
        <div
          className={`absolute inset-0 ${placeholderClasses}`}
          aria-hidden="true"
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        style={{ objectFit }}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        sizes={fill ? "(max-width: 768px) 100vw, 50vw" : undefined}
      />
    </div>
  );
}
