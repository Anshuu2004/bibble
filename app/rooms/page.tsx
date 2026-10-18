"use client";

import { StudyRoomCard } from "@/components/rooms/study-room-card";
import { SiteHeader } from "@/components/site-header";
import { studyRooms } from "@/data/study-rooms";
import { Search, Star, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function RoomsPage() {
  const [query, setQuery] = useState("");

  const rooms = useMemo(
    () =>
      studyRooms.filter((room) =>
        `${room.name} ${room.topic} ${room.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <main className="rooms-page">
      <SiteHeader />
      <section className="rooms-intro">
        <div>
          <span className="eyebrow">
            <Star size={14} /> Study together, softly
          </span>
          <h1>
            Find your little<br />
            <em>study table.</em>
          </h1>
          <p>
            Drop into a cozy room, set a gentle focus timer, and let the quiet company carry you forward.
          </p>
        </div>
        <div className="rooms-counter">
          <Users size={18} />
          <strong>21</strong>
          <span>
            people learning<br />
            together right now
          </span>
        </div>
      </section>

      <div className="rooms-toolbar">
        <div className="room-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a topic or room"
            aria-label="Search study rooms"
          />
        </div>
        <span className="rooms-toolbar-note">
          {rooms.length} open rooms · no sign-up needed
        </span>
      </div>

      <section className="room-grid">
        {rooms.map((room) => (
          <StudyRoomCard key={room.id} room={room} />
        ))}
      </section>

      <section className="rooms-callout cozy-wallpaper-pattern">
        <div className="callout-spark">
          <Star size={22} />
        </div>
        <div>
          <span className="eyebrow">Make your own corner</span>
          <h2>Can&apos;t find the right room?</h2>
          <p>
            Start with a map and make a room around the thing you&apos;re learning today.
          </p>
        </div>
        <Link href="/create" className="button-primary">
          Create a map <Star size={16} />
        </Link>
      </section>
    </main>
  );
}
