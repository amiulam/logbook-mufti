import { Event, EventWithTools } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, ToolCase, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import StartEventButton from "./start-event-button";
import EndEventButton from "./end-event-button";
import DeleteEventButton from "./delete-event-button";
import EditEventDialog from "./edit-event-dialog";

type EventCardProps = {
  event: EventWithTools;
};

export default function EventCard({ event }: EventCardProps) {
  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "not_started":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "in_progress":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Event["status"]) => {
    switch (status) {
      case "not_started":
        return "Not Started";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  // Calculate total images across all tools
  const totalImages = event.tools.reduce((total, tool) => {
    return total + (tool.images?.length || 0);
  }, 0);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{event.name}</CardTitle>
          <Badge className={getStatusColor(event.status)}>
            {getStatusText(event.status)}
          </Badge>
        </div>
        {event.document && (
          <p className="text-sm text-muted-foreground">
            Surat Tugas:{" "}
            <span>
              <Link
                href={event.document.publicUrl}
                className="hover:underline underline-offset-3"
              >
                {event.assignmentLetter}
              </Link>
            </span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="size-4 mr-2" />
            Dibuat: {format(new Date(event.createdAt), "MMM dd, yyyy")}
          </div>

          {event.startDate && (
            <div className="text-sm text-muted-foreground">
              Dimulai: {format(new Date(event.startDate), "MMM dd, yyyy HH:mm")}
            </div>
          )}

          {event.endDate && (
            <div className="text-sm text-muted-foreground">
              Berakhir: {format(new Date(event.endDate), "MMM dd, yyyy HH:mm")}
            </div>
          )}

          {/* Tools and Images Summary */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <ToolCase className="size-4" />
              <span>{event.tools.length} Alat</span>
            </div>
            {totalImages > 0 && (
              <div className="flex items-center gap-1">
                <ImageIcon className="size-4" />
                <span>{totalImages} Gambar</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Link href={`/app/events/${event.publicId}`}>
              <Button variant="outline" size="sm">
                <Eye className="size-4" />
                Detail
              </Button>
            </Link>

            <EditEventDialog event={event} />

            {event.status === "not_started" && (
              <StartEventButton eventId={event.id} />
            )}

            {event.status === "in_progress" && (
              <EndEventButton eventId={event.id} />
            )}
            
            <DeleteEventButton eventId={event.id} eventName={event.name} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
