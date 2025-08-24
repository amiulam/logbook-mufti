"use client";
import { Button } from "@/components/ui/button";
import { useEventStore } from "@/stores/eventStores";
import { Square } from "lucide-react";

export default function EndEventButton({ eventId }: { eventId: number }) {
  const setEndEventModal = useEventStore(
    (state) => state.setEndModalDialogOpen
  );

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => setEndEventModal(true, eventId.toString())}
    >
      <Square className="size-4" />
      Selesai
    </Button>
  );
}
