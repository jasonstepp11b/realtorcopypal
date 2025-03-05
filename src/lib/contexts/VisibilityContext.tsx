"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface VisibilityContextType {
  isVisible: boolean;
  wasEverHidden: boolean;
  lastVisibleTimestamp: number;
}

const VisibilityContext = createContext<VisibilityContextType>({
  isVisible: true,
  wasEverHidden: false,
  lastVisibleTimestamp: Date.now(),
});

export function VisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [wasEverHidden, setWasEverHidden] = useState<boolean>(false);
  const [lastVisibleTimestamp, setLastVisibleTimestamp] = useState<number>(
    Date.now()
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      setIsVisible(visible);

      if (visible) {
        setLastVisibleTimestamp(Date.now());
      } else {
        setWasEverHidden(true);
      }
    };

    // Set initial state
    setIsVisible(document.visibilityState === "visible");

    // Add event listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <VisibilityContext.Provider
      value={{ isVisible, wasEverHidden, lastVisibleTimestamp }}
    >
      {children}
    </VisibilityContext.Provider>
  );
}

export const useVisibility = () => useContext(VisibilityContext);
