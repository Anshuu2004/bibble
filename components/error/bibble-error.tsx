"use client";

import { useTheme } from "@/hooks/use-theme";
import { ArrowUpRight, Home, Compass, RefreshCw, WifiOff, Server } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export type ErrorType = "not-found" | "offline" | "server-error";

interface BibbleErrorProps {
  type: ErrorType;
  onRetry?: () => void;
}

interface ButtonConfig {
  label: string;
  icon: React.ReactNode;
  variant: "primary" | "secondary";
  href?: string;
  onClick?: boolean;
  trailingIcon?: React.ReactNode;
}

interface ErrorContent {
  icon: React.ReactNode | null;
  largeNumber: string | null;
  heading: string;
  description: string;
  subtext: string | null;
  primaryButton: ButtonConfig;
  secondaryButton: ButtonConfig;
}

const errorContent: Record<ErrorType, ErrorContent> = {
  "not-found": {
    icon: null,
    largeNumber: "404",
    heading: "Looks like this page wandered off.",
    description: "We couldn't find the page you're looking for. It may have moved, disappeared, or never existed in the first place.",
    subtext: "Keep learning. We'll help you find your way.",
    primaryButton: {
      label: "Back to Home",
      icon: <Home size={18} />,
      href: "/",
      variant: "primary",
    },
    secondaryButton: {
      label: "Explore Maps",
      icon: <Compass size={18} />,
      href: "/explore",
      trailingIcon: <ArrowUpRight size={18} />,
      variant: "secondary",
    },
  },
  offline: {
    icon: <WifiOff size={48} />,
    largeNumber: null,
    heading: "You're offline",
    description: "Looks like your connection took a little break. Check your internet connection and try again.",
    subtext: null,
    primaryButton: {
      label: "Try Again",
      icon: <RefreshCw size={18} />,
      onClick: true,
      variant: "primary",
    },
    secondaryButton: {
      label: "Back to Home",
      icon: <Home size={18} />,
      href: "/",
      variant: "secondary",
    },
  },
  "server-error": {
    icon: <Server size={48} />,
    largeNumber: null,
    heading: "We couldn't reach Bibble",
    description: "Something went wrong while connecting to the server. Please try again.",
    subtext: null,
    primaryButton: {
      label: "Try Again",
      icon: <RefreshCw size={18} />,
      onClick: true,
      variant: "primary",
    },
    secondaryButton: {
      label: "Back to Home",
      icon: <Home size={18} />,
      href: "/",
      variant: "secondary",
    },
  },
};

export function BibbleError({ type, onRetry }: BibbleErrorProps) {
  const { motif } = useTheme();
  const content = errorContent[type];

  return (
    <motion.div
      className="error-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Floating decorative elements */}
      <motion.div
        className="decoration decoration-1"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {motif.fruitEmoji}
      </motion.div>
      <motion.div
        className="decoration decoration-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {motif.secondaryFruitEmoji}
      </motion.div>
      <motion.div
        className="decoration decoration-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {motif.treatEmoji}
      </motion.div>

      {/* Error icon for offline/server errors */}
      {content.icon && (
        <motion.div
          className="error-icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {content.icon}
        </motion.div>
      )}

      {/* Large number for 404 */}
      {content.largeNumber && (
        <motion.div
          className="error-large-number"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {content.largeNumber}
        </motion.div>
      )}

      <motion.h1
        className="error-heading"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {content.heading}
      </motion.h1>

      <motion.p
        className="error-description"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {content.description}
      </motion.p>

      {content.subtext && (
        <motion.div
          className="error-subtext"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {content.subtext} {motif.treatEmoji}
        </motion.div>
      )}

      <motion.div
        className="error-actions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {content.primaryButton.onClick ? (
          <button
            onClick={onRetry}
            className={`button-${content.primaryButton.variant} button-large`}
          >
            {content.primaryButton.icon}
            {content.primaryButton.label}
          </button>
        ) : (
          <Link
            href={content.primaryButton.href || "/"}
            className={`button-${content.primaryButton.variant} button-large`}
          >
            {content.primaryButton.icon}
            {content.primaryButton.label}
          </Link>
        )}

        {content.secondaryButton.onClick ? (
          <button
            onClick={onRetry}
            className={`button-${content.secondaryButton.variant} button-large`}
          >
            {content.secondaryButton.icon}
            {content.secondaryButton.label}
          </button>
        ) : (
          <Link
            href={content.secondaryButton.href || "/"}
            className={`button-${content.secondaryButton.variant} button-large`}
          >
            {content.secondaryButton.icon}
            {content.secondaryButton.label}
            {content.secondaryButton.trailingIcon}
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
