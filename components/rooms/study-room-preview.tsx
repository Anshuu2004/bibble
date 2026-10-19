"use client";

import { useTheme } from "@/hooks/use-theme";
import type { StudyRoom } from "@/types/room";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Check, Clock3, Headphones, Play, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function StudyRoomPreview({ room }: { room: StudyRoom }) {
  const { motif } = useTheme();
  const [seconds, setSeconds] = useState(42 * 60);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const time = `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className={`study-room-preview study-room-preview-${room.color}`}>
      <div className="study-preview-top">
        <span className="room-mood">Live study room · {motif.fruitEmoji}</span>
        <span>{room.participants + 1}/{room.capacity} seats</span>
      </div>
      <Card className="live-session-card gap-0 border-border/80 bg-card py-0 shadow-sm">
        <CardHeader className="border-b border-border/70 px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Badge variant="secondary" className="mb-2 gap-1.5 bg-[var(--lavender)] text-[var(--primary)]"><Headphones /> {room.topic}</Badge>
              <CardTitle className="text-2xl text-foreground">{room.name}</CardTitle>
              <CardDescription className="mt-1.5 max-w-sm text-[var(--muted)]">{room.description}</CardDescription>
            </div>
            <Badge variant="outline" className="shrink-0 border-[var(--border)] text-[var(--muted)]">{motif.brandEmoji} {motif.name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 px-5 py-4 sm:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-xl border border-border/70 bg-[var(--surface-soft)] p-4 cozy-wallpaper-pattern">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide text-[var(--muted)] uppercase">Focus session</span>
              <Button variant="ghost" size="icon-xs" className="rounded-full text-primary hover:bg-card" onClick={() => setActive((value) => !value)} aria-label={active ? "Pause focus session" : "Start focus session"}><Play fill="currentColor" /></Button>
            </div>
            <div className="flex items-end justify-between gap-3">
              <strong className="font-[var(--font-display)] text-4xl leading-none tracking-tight text-foreground">{time}</strong>
              <span className="pb-1 text-xs font-bold text-[var(--primary)]">{active ? "In progress" : "Ready when you are"}</span>
            </div>
            <Progress value={active ? 52 : 18} className="mt-4 h-1.5 bg-card [&_[data-slot=progress-indicator]]:bg-primary" />
          </section>
          <section className="rounded-xl border border-border/70 bg-card p-4">
            <span className="text-xs font-bold tracking-wide text-[var(--muted)] uppercase">Room rhythm</span>
            <div className="mt-3 space-y-2 text-xs font-medium text-[var(--muted)]">
              <div className="flex items-center gap-2"><Check size={14} className="text-primary" /> Gentle focus, no pressure</div>
              <div className="flex items-center gap-2"><Clock3 size={14} className="text-primary" /> {room.minutes} minute session</div>
            </div>
          </section>
        </CardContent>
        <CardFooter className="justify-between gap-3 px-5 py-4 border-t border-border/70 bg-[var(--surface-soft)] rounded-b-xl">
          <div className="flex items-center gap-2">
            <AvatarGroup>{["M", "N", "Y"].map((person) => <Avatar key={person} size="sm"><AvatarFallback className="bg-card text-[var(--primary)] font-bold">{person}</AvatarFallback></Avatar>)}</AvatarGroup>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--muted)]"><Users size={14} /> studying now</span>
          </div>
          <Button asChild size="sm" className="rounded-full px-4 font-bold"><Link href={`/rooms/${room.id}`}>Enter room <ArrowUpRight /></Link></Button>
        </CardFooter>
      </Card>
    </div>
  );
}
