"use client";

import { useEffect, useState } from "react";
import { BibbleError, ErrorType } from "./bibble-error";
import { useRouter } from "next/navigation";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
      // If we were showing offline UI, dismiss it when connection returns
      if (errorType === "offline") {
        setErrorType(null);
      }
    }

    function handleOffline() {
      setIsOnline(false);
      // Show offline UI when connection is lost
      setErrorType("offline");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [errorType]);

  const handleRetry = () => {
    // Check if we're back online
    if (navigator.onLine) {
      setErrorType(null);
      setIsOnline(true);
    } else {
      // Still offline, keep showing the error
      setErrorType("offline");
    }
  };

  // If we're showing an error, render the error UI
  if (errorType) {
    return (
      <div className="error-page">
        <main className="not-found-main">
          <BibbleError type={errorType} onRetry={handleRetry} />
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
