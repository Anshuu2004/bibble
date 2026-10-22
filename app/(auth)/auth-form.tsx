"use client";

import { ThemePicker } from "@/components/ui/theme-picker";
import { useTheme } from "@/hooks/use-theme";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "./auth.module.css";

type AuthMode = "login" | "signup";

const accountKey = "bibble-account";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const { motif } = useTheme();
  const isSignup = mode === "signup";
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();

    if (isSignup) {
      window.localStorage.setItem(accountKey, JSON.stringify({ name, email }));
      setMessage(`Your local Bibble account is ready, ${name || "friend"}.`);
      return;
    }

    const saved = window.localStorage.getItem(accountKey);
    const account = saved ? (JSON.parse(saved) as { email?: string }) : null;
    setMessage(account?.email === email ? "Welcome back — you're signed in on this browser." : "No local account matches that email. You can sign up in a moment.");
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className="brand">
          <span className="brand-mark">{motif.brandEmoji}</span>
          <span>Bibble</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <ThemePicker compact />
          <Link href="/" className={styles.back}>Keep browsing <ArrowRight size={15} /></Link>
        </div>
      </header>
      <section className={styles.shell} aria-labelledby="auth-title">
        <span className={`eyebrow ${styles.eyebrow}`}><Sparkles size={14} /> Your little learning corner</span>
        <h1 id="auth-title" className={styles.title}>{isSignup ? "Make it yours." : "Welcome back."}</h1>
        <p className={styles.copy}>{isSignup ? "Create an account to keep your Bibble identity close. You can still browse every sample map and study room without one." : "Log in to your local Bibble account. Browsing, previews, and map-making are always open."}</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          {isSignup && <div className={styles.field}><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" required /></div>}
          <div className={styles.field}><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
          <button className={styles.submit} type="submit">{isSignup ? "Create account" : "Log in"} <ArrowRight size={16} /></button>
          {message && <p className={styles.message} role="status">{message}</p>}
        </form>
        <p className={styles.switch}>{isSignup ? <>Already have an account? <Link href="/login">Log in</Link></> : <>New here? <Link href="/signup">Create an account</Link></>}</p>
        <p className={styles.note}>This simple project demo stores account details only in this browser; it is not a secure production authentication system.</p>
      </section>
    </main>
  );
}
