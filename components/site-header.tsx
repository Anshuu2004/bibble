"use client";

import { ThemePicker } from "@/components/ui/theme-picker";
import { useTheme } from "@/hooks/use-theme";
import { ArrowUpRight, LogIn, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const { motif } = useTheme();
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">{motif.brandEmoji}</span>
          <span>Bibble</span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link
            href="/explore"
            className={pathname === "/explore" ? "nav-link nav-active" : "nav-link"}
          >
            Explore maps
          </Link>
          <Link
            href="/rooms"
            className={pathname.startsWith("/rooms") ? "nav-link nav-active" : "nav-link"}
          >
            Study rooms
          </Link>
          <Link
            href="/progress"
            className={pathname === "/progress" ? "nav-link nav-active" : "nav-link"}
          >
            My progress
          </Link>
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
      </div>
    </header>
  );
}
