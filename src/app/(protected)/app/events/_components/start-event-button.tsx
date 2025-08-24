"use client";

import { Button } from "@/components/ui/button";
import { startEvent } from "@/services/events";
import { Play } from "lucide-react";
import React from "react";

export default function StartEventButton({ eventId }: { eventId: number }) {
  const handleStartEvent = async () => {
    try {
      await startEvent(eventId);
    } catch (error) {
      console.error("Error starting event:", error);
    }
  };
  return (
    <Button
      size="sm"
      onClick={handleStartEvent}
      className="bg-green-600 hover:bg-green-700"
    >
      <Play className="size-4" />
      Start
    </Button>
  );
}
