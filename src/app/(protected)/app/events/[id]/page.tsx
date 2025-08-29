import { Event } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import ToolCard from "@/app/(protected)/app/events/_components/tool-card";
import CreateToolDialog from "@/app/(protected)/app/events/_components/create-tool-dialog";
import { getEventById } from "@/services/events";
import StartEventButton from "../_components/start-event-button";
import EndEventButton from "../_components/end-event-button";

type EventDetailPageProps = {
  id: string;
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<EventDetailPageProps>;
}) {
  const { id } = await params;

  // Check if id is a valid number
  if (isNaN(Number(id))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid Event ID</h2>
          <p className="text-gray-600 mb-4">
            The event ID provided is not valid.
          </p>
          <Link href="/app/events">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const event = await getEventById(id);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">
            The event you&apos;re looking for doesn&apos;t exist or may have
            been deleted.
          </p>
          <Link href="/app/events">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "not_started":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/app/events">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="size-4" />
              Kembali
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{event.name}</CardTitle>
                  <Badge className={getStatusColor(event.status)}>
                    {getStatusText(event.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.document && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Surat Tugas :
                    </span>
                    <Link
                      href={event.document?.publicUrl}
                      className="hover:underline underline-offset-3"
                    >
                      {event.assignmentLetter}
                    </Link>
                  </div>
                )}

                <div>
                  <span className="text-sm text-muted-foreground">Dibuat:</span>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(event.createdAt), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>

                {event.startDate && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Started:
                    </span>
                    <p className="font-medium text-green-600">
                      {format(new Date(event.startDate), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                )}

                {event.endDate && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Ended:
                    </span>
                    <p className="font-medium text-gray-600">
                      {format(new Date(event.endDate), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  {event.status === "not_started" && (
                    <StartEventButton eventId={event.id} />
                  )}

                  {event.status === "in_progress" && (
                    <EndEventButton eventId={event.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tools Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                Alat ({event.tools.length})
              </h2>
              {event.status !== "completed" && (
                <CreateToolDialog
                  eventId={event.id}
                  // onToolAdded={handleToolAdded}
                />
              )}
            </div>

            {event.tools.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    Daftar alat belum tersedia untuk kegiatan ini.
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    eventStatus={event.status}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
