"use client";

import { ThemePicker } from "@/components/ui/theme-picker";
import { useTheme } from "@/hooks/use-theme";
import { ArrowUpRight, LogIn, UserRoundPlus } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  const { motif } = useTheme();

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand-mark">{motif.brandEmoji}</span>
        <span>Bibble</span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/explore">Explore maps</Link>
        <Link href="/rooms">Study rooms</Link>
        <ThemePicker compact />
        <Link href="/login" className="nav-login">
          <LogIn size={15} /> Log in
        </Link>
        <Link href="/signup" className="nav-signup">
          <UserRoundPlus size={15} /> Sign up
        </Link>
        <Link href="/create" className="nav-cta">
          Create a map <ArrowUpRight size={15} />
        </Link>
      </nav>
    </header>
  );
}


