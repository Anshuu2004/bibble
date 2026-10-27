import { CustomRoomPage } from "@/components/rooms/custom-room-page";
import { StudyRoomShell } from "@/components/rooms/study-room-shell";
import { getStudyRoom } from "@/data/study-rooms";

export default async function StudyRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = getStudyRoom(id);
  if (!room) return <CustomRoomPage id={id} />;
  return <StudyRoomShell room={room} />;
}
