"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const guideSteps = [
  {
    title: "Join a study room",
    copy: "Pick a room, open it and press Take a seat to sit down with the others.",
    href: "/rooms",
    action: "Browse rooms",
  },
  {
    title: "Use the focus timer",
    copy: "Inside a room, press Start focus session and keep going until the timer ends.",
    href: "/rooms",
    action: "Find a room",
  },
  {
    title: "Create a learning map",
    copy: "Name a topic and connect the ideas you learn as bibbles on a map.",
    href: "/create",
    action: "Create a map",
  },
];

export function WelcomeGuide() {
  const [dismissed, setDismissed, hydrated] = useLocalStorage("bibble-welcome-dismissed", false);

  // useLocalStorage sets `hydrated` a tick before the stored value is applied,
  // so wait one more tick or dismissed visitors would see the card flash.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => setReady(true), 0);
    return () => window.clearTimeout(timer);
  }, [hydrated]);

  if (!ready || dismissed) return null;

  return (
    <section className="welcome-guide" aria-labelledby="welcome-guide-title">
      <div className="welcome-guide-header">
        <div>
          <span className="eyebrow">New here?</span>
          <h2 id="welcome-guide-title">Three small steps to get started</h2>
        </div>
        <button
          type="button"
          className="welcome-guide-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss the welcome guide"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <ol className="welcome-guide-steps">
        {guideSteps.map((step) => (
          <li key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
            <Link href={step.href} className="text-link">
              {step.action} <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
