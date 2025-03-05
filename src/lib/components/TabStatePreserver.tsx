"use client";

import React, { useRef, useEffect } from "react";
import { useVisibility } from "../contexts/VisibilityContext";

interface TabStatePreserverProps {
  children: React.ReactNode;
  id: string; // Unique identifier for this component
  refreshOnVisible?: boolean; // Whether to trigger a refresh when tab becomes visible
  onVisibilityChange?: (isVisible: boolean) => void; // Callback when visibility changes
}

/**
 * This component preserves the state of its children when the tab becomes inactive
 * and optionally refreshes data when the tab becomes visible again.
 */
export default function TabStatePreserver({
  children,
  id,
  refreshOnVisible = false,
  onVisibilityChange,
}: TabStatePreserverProps) {
  const { isVisible, wasEverHidden, lastVisibleTimestamp } = useVisibility();
  const lastVisibleTimestampRef = useRef(lastVisibleTimestamp);

  useEffect(() => {
    // Call the visibility change callback if provided
    if (onVisibilityChange) {
      onVisibilityChange(isVisible);
    }

    // Update the ref when timestamp changes
    if (lastVisibleTimestamp !== lastVisibleTimestampRef.current) {
      lastVisibleTimestampRef.current = lastVisibleTimestamp;
    }
  }, [isVisible, onVisibilityChange, lastVisibleTimestamp]);

  // The children are always rendered regardless of visibility state
  // This ensures state is preserved
  return (
    <div
      id={`tab-state-preserver-${id}`}
      data-visible={isVisible}
      data-last-visible={lastVisibleTimestamp}
    >
      {children}
    </div>
  );
}
