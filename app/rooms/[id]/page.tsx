import { StudyRoomShell } from "@/components/rooms/study-room-shell";
import { getStudyRoom } from "@/data/study-rooms";
import { notFound } from "next/navigation";

export default async function StudyRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = getStudyRoom(id);
  if (!room) notFound();
  return <StudyRoomShell room={room} />;
}
