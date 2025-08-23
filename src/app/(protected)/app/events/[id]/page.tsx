// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import { Event } from "@/types";
// import { getEventById, startEvent, endEvent } from '@/services/events';
// import { getToolsByEventId, deleteTool } from '@/services/tools';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Play, Square, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import ToolCard from "@/components/ToolCard";
import AddToolDialog from "@/app/(protected)/app/events/_components/add-tool-dialog";
// import EndEventModal from "@/app/(protected)/app/events/_components/EndEventModal";
import { getEventById } from "@/services/events";

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
            The event you're looking for doesn't exist or may have been deleted.
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

  // const tools = await getToolsByEventId(event.id);
  // const router = useRouter();
  // const [event, setEvent] = useState<Event | null>(null);
  // const [tools, setTools] = useState<Tool[]>([]);
  // const [endEventModal, setEndEventModal] = useState(false);

  // const {id} = use(params);

  // // const event = getEventById(id);

  // useEffect(() => {
  //   loadEventData();
  // }, [id, router]);

  // const loadEventData = async () => {
  //   try {
  //     // const eventData = await getEventById(id);
  //     // if (!eventData) {
  //     //   router.push('/');
  //     //   return;
  //     // }

  //     // setEvent(eventData);
  //     // const toolsData = await getToolsByEventId(id);
  //     // setTools(toolsData);
  //   } catch (error) {
  //     console.error('Error loading event data:', error);
  //     router.push('/');
  //   }
  // };

  // const handleStartEvent = async () => {
  //   try {
  //     // const updatedEvent = await startEvent(event.id);
  //     // if (updatedEvent) {
  //     //   setEvent(updatedEvent);
  //     // }
  //   } catch (error) {
  //     console.error('Error starting event:', error);
  //   }
  // };

  // const handleEndEvent = () => {
  //   if (tools.length > 0) {
  //     setEndEventModal(true);
  //   } else {
  //     confirmEndEvent();
  //   }
  // };

  // const confirmEndEvent = async () => {
  //   try {
  //     // const updatedEvent = await endEvent(event.id);
  //     // if (updatedEvent) {
  //     //   setEvent(updatedEvent);
  //     // }
  //     setEndEventModal(false);
  //   } catch (error) {
  //     console.error('Error ending event:', error);
  //   }
  // };

  // const handleToolAdded = async (tool: Tool) => {
  //   setTools(prev => [tool, ...prev]);
  // };

  // const handleToolDeleted = async (toolId: string) => {
  //   try {
  //     // const success = await deleteTool(toolId);
  //     // if (success) {
  //     //   setTools(prev => prev.filter(tool => tool.id !== toolId));
  //     // }
  //   } catch (error) {
  //     console.error('Error deleting tool:', error);
  //   }
  // };

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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
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
                {event.assignmentLetter && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Assignment Letter:
                    </span>
                    <p className="font-medium">{event.assignmentLetter}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm text-muted-foreground">
                    Created:
                  </span>
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
                    <Button
                      // onClick={handleStartEvent}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Event
                    </Button>
                  )}

                  {event.status === "in_progress" && (
                    <Button
                      // onClick={handleEndEvent}
                      variant="destructive"
                      className="w-full"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      End Event
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tools Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Tools ({event.tools.length})</h2>
              {event.status !== "completed" && (
                <AddToolDialog
                  eventId={event.id}
                  // onToolAdded={handleToolAdded}
                />
              )}
            </div>

            {event.tools.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    No tools assigned to this event yet.
                  </div>
                  {event.status !== "completed" && (
                    <AddToolDialog
                      eventId={event.id}
                      // onToolAdded={handleToolAdded}
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    // onDelete={handleToolDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* <EndEventModal
          open={endEventModal}
          onOpenChange={setEndEventModal}
          tools={tools}
          onConfirm={confirmEndEvent}
        /> */}
      </div>
    </div>
  );
}
