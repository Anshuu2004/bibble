"use client";

import { useActionState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { login, signup } from "@/app/actions/auth";
import { passwordRequirements } from "@/lib/auth/validation";
import { ThemePicker } from "@/components/ui/theme-picker";
import { useTheme } from "@/hooks/use-theme";
import styles from "./auth.module.css";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const { motif } = useTheme();
  const isSignup = mode === "signup";
  const [state, formAction, pending] = useActionState(
    isSignup ? signup : login,
    undefined,
  );

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
        <p className={styles.copy}>{isSignup ? "Create an account to keep your Bibble identity close. You can still browse every sample map and study room without one." : "Log in to your Bibble account. Browsing, previews, and map-making are always open."}</p>
        <form className={styles.form} action={formAction}>
          {isSignup && <div className={styles.field}><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" required /></div>}
          <div className={styles.field}><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
          <div className={styles.field}><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} aria-describedby={isSignup ? "password-help" : undefined} required /></div>
          {isSignup && <>
            <p id="password-help" className={styles.note} aria-live="polite">Your password should have:</p>
            <ul className={styles.note}>{passwordRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
            <div className={styles.field}><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required /></div>
          </>}
          {state?.message && <p className={styles.message} role="alert">{state.message}</p>}
          <button className={styles.submit} type="submit" disabled={pending}>{pending ? "Please wait..." : isSignup ? "Create account" : "Log in"} <ArrowRight size={16} /></button>
        </form>
        <p className={styles.switch}>{isSignup ? <>Already have an account? <Link href="/login">Log in</Link></> : <>New here? <Link href="/signup">Create an account</Link></>}</p>
        <p className={styles.note}>Your password is securely handled by Supabase Auth and is never stored in plaintext.</p>
      </section>
    </main>
  );
}
