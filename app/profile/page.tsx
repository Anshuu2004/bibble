"use client";

import { SiteHeader } from "@/components/site-header";
import { categories } from "@/data/categories";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Pencil, Plus, Sparkles, UserRound, X } from "lucide-react";
import { useState } from "react";
import styles from "./profile.module.css";

interface Profile {
  displayName: string;
  bio: string;
  interests: string[];
}

const emptyProfile: Profile = { displayName: "", bio: "", interests: [] };
const MAX_NAME = 40;
const MAX_BIO = 160;
const MAX_INTERESTS = 8;
const suggestions = categories.filter((category) => category !== "All maps");

function hasDetails(profile: Profile) {
  return Boolean(profile.displayName || profile.bio || profile.interests.length);
}

export default function ProfilePage() {
  const [profile, setProfile, hydrated] = useLocalStorage<Profile>("bibble-profile", emptyProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(emptyProfile);
  const [interestInput, setInterestInput] = useState("");

  function startEditing() {
    setDraft(profile);
    setInterestInput("");
    setEditing(true);
  }

  function addInterest(raw: string) {
    const value = raw.trim().replace(/\s+/g, " ");
    if (!value || draft.interests.length >= MAX_INTERESTS) return;
    if (draft.interests.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setDraft((current) => ({ ...current, interests: [...current.interests, value] }));
    setInterestInput("");
  }

  function removeInterest(value: string) {
    setDraft((current) => ({ ...current, interests: current.interests.filter((item) => item !== value) }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setProfile({
      displayName: draft.displayName.trim(),
      bio: draft.bio.trim(),
      interests: draft.interests,
    });
    setEditing(false);
  }

  const showEmptyState = hydrated && !editing && !hasDetails(profile);

  return (
    <main className={styles.page}>
      <SiteHeader />
      <div className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>
            <UserRound size={14} /> Your profile
          </p>
          <h1>About you</h1>
          <p className={styles.sub}>
            Saved in this browser only for now. Account sync will come with the backend.
          </p>
        </header>

        {!hydrated && <p className={styles.sub}>Loading your profile…</p>}

        {showEmptyState && (
          <section className={styles.emptyCard} aria-labelledby="profile-empty-title">
            <div className={styles.emptyBadge} aria-hidden="true">
              <Sparkles size={28} />
            </div>
            <h2 id="profile-empty-title">No profile details yet</h2>
            <p>Add a display name, a short bio and what you like to learn so your space feels like yours.</p>
            <button type="button" className={styles.primary} onClick={startEditing}>
              <Pencil size={15} /> Add your details
            </button>
          </section>
        )}

        {hydrated && !editing && hasDetails(profile) && (
          <section className={styles.card} aria-label="Profile details">
            <div className={styles.cardTop}>
              <div className={styles.avatar} aria-hidden="true">
                {(profile.displayName || "B").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2>{profile.displayName || "Unnamed learner"}</h2>
                <p className={styles.bio}>{profile.bio || "No bio yet."}</p>
              </div>
              <button type="button" className={styles.secondary} onClick={startEditing}>
                <Pencil size={14} /> Edit
              </button>
            </div>
            <h3>Learning interests</h3>
            {profile.interests.length > 0 ? (
              <ul className={styles.chips}>
                {profile.interests.map((interest) => (
                  <li key={interest} className={styles.chip}>
                    {interest}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>No interests added yet.</p>
            )}
          </section>
        )}

        {hydrated && editing && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor="profile-name">
              Display name
              <input
                id="profile-name"
                value={draft.displayName}
                maxLength={MAX_NAME}
                onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
                placeholder="What should we call you?"
              />
            </label>

            <label htmlFor="profile-bio">
              Short bio
              <textarea
                id="profile-bio"
                value={draft.bio}
                maxLength={MAX_BIO}
                rows={3}
                onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
                placeholder="A line or two about what you are learning."
              />
              <span className={styles.counter}>
                {draft.bio.length}/{MAX_BIO}
              </span>
            </label>

            <div className={styles.field}>
              <label htmlFor="profile-interest">Learning interests</label>
              <div className={styles.interestRow}>
                <input
                  id="profile-interest"
                  value={interestInput}
                  onChange={(event) => setInterestInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      addInterest(interestInput);
                    }
                  }}
                  placeholder="Type a topic and press Enter"
                  disabled={draft.interests.length >= MAX_INTERESTS}
                />
                <button type="button" className={styles.secondary} onClick={() => addInterest(interestInput)}>
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className={styles.suggestions} aria-label="Suggested topics">
                {suggestions.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className={styles.suggestion}
                    onClick={() => addInterest(topic)}
                    disabled={draft.interests.includes(topic) || draft.interests.length >= MAX_INTERESTS}
                  >
                    + {topic}
                  </button>
                ))}
              </div>
              {draft.interests.length > 0 && (
                <ul className={styles.chips}>
                  {draft.interests.map((interest) => (
                    <li key={interest} className={styles.chip}>
                      {interest}
                      <button type="button" aria-label={`Remove ${interest}`} onClick={() => removeInterest(interest)}>
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <span className={styles.counter}>
                {draft.interests.length}/{MAX_INTERESTS} topics
              </span>
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.primary}>
                Save profile
              </button>
              <button type="button" className={styles.secondary} onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
