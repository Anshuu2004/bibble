"use client";

import { MapPreview } from "@/components/map/map-preview";
import { StudyRoomPreview } from "@/components/rooms/study-room-preview";
import { SiteHeader } from "@/components/site-header";
import { defaultMap } from "@/data/sample-maps";
import { studyRooms } from "@/data/study-rooms";
import { useTheme } from "@/hooks/use-theme";
import { ArrowDown, ArrowUpRight, Check, Headphones, Star, Users } from "lucide-react";
import Link from "next/link";

const steps = [
  ["01", "Find your table", "Choose a room that matches your energy and the thing you want to learn."],
  ["02", "Settle in", "Start a gentle focus session, keep your camera off, and make progress beside others."],
  ["03", "Grow your map", "Capture what you learn in connected bibbles you can come back to anytime."],
];

export default function Home() {
  const { motif } = useTheme();

  return (
    <main className="home-page">
      <SiteHeader />
      <section className="hero-section hero-study-section">
        <div className="hero-copy">
          <span className="eyebrow">
            <Headphones size={14} /> {motif.fruitEmoji} Study together, softly
          </span>
          <h1>
            A cozy little space to <em>grow</em> what you know.
          </h1>
          <p>
            Find a quiet room, settle into a focus session, and learn alongside people who are making room for the same kind of progress.
          </p>
          <div className="hero-actions">
            <Link href="/rooms" className="button-primary">
              Preview this project <ArrowUpRight size={17} />
            </Link>
            <Link href="/create" className="button-secondary">
              Create a map <ArrowDown size={16} />
            </Link>
          </div>
          <div className="hero-note">
            <span className="avatar-stack">
              <i />
              <i />
              <i />
            </span>
            <span>{motif.treatEmoji} 21 curious minds are learning together.</span>
          </div>
        </div>
        <StudyRoomPreview room={studyRooms[0]} />
      </section>
      <section className="rooms-preview">
        <div className="rooms-preview-heading">
          <div>
            <span className="eyebrow">
              <Headphones size={14} /> {motif.fruitEmoji} More study rooms
            </span>
            <h2>Good company for the quiet parts.</h2>
          </div>
          <Link href="/rooms" className="text-link">
            See all rooms <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="rooms-preview-grid">
          {studyRooms.slice(1, 4).map((room) => (
            <Link
              href={`/rooms/${room.id}`}
              className={`mini-room mini-room-${room.color}`}
              key={room.id}
            >
              <span className="mini-room-icon">
                {motif.fruitEmoji}
              </span>
              <div className="mini-room-info">
                <strong>{room.name}</strong>
                <span>{room.topic}</span>
              </div>
              <small>
                <Users size={12} /> {room.participants} learning
              </small>
            </Link>
          ))}
        </div>
      </section>

      <section className="how-section">
        <div className="section-heading">
          <span className="eyebrow">
            <Star size={14} /> {motif.secondaryFruitEmoji} The Bibble way
          </span>
          <h2>Learning is more memorable when it has a shape.</h2>
        </div>
        <div className="how-grid">
          {steps.map(([number, title, copy]) => (
            <div className="how-item" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <div className="showcase-copy">
          <span className="eyebrow">
            <Star size={14} /> {motif.brandEmoji} Your learning world
          </span>
          <h2>Take the quiet work with you.</h2>
          <p>
            Turn a good study session into a visual map. Connect the ideas that clicked and keep your next step close.
          </p>
          <Link href="/map/dsa-roadmap" className="text-link">
            Explore a learning map <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="showcase-preview">
          <MapPreview map={defaultMap} />
        </div>
      </section>

      <section className="final-cta cozy-wallpaper-pattern">
        <Star size={22} />
        <h2>Make a little room for what comes next {motif.fruitEmoji}</h2>
        <Link href="/rooms" className="button-primary">
          Find your study table <ArrowUpRight size={17} />
        </Link>
      </section>

      <footer className="site-footer">
        <span>© 2026 Bibble</span>
        <span>
          <Check size={14} /> {motif.treatEmoji} A calm place to learn
        </span>
      </footer>
    </main>
  );
}
