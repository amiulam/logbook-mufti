"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Event, Tool } from '@/types';
import { getEventById, startEvent, endEvent } from '@/lib/events';
import { getToolsByEventId, deleteTool } from '@/lib/tools';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Play, Square, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import AddToolModal from '@/components/AddToolModal';
import EndEventModal from '@/components/EndEventModal';
import { use } from 'react';

type EventDetailPageProps = {
   id: string;
}

export default function EventDetailPage({ params }: {params: Promise<EventDetailPageProps>}) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [endEventModal, setEndEventModal] = useState(false);

  const {id} = use(params);

  // const event = getEventById(id);

  useEffect(() => {
    const eventData = getEventById(id);
    if (!eventData) {
      router.push('/');
      return;
    }
    
    setEvent(eventData);
    setTools(getToolsByEventId(id));
  }, [id, router]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleStartEvent = () => {
    const updatedEvent = startEvent(event.id);
    if (updatedEvent) {
      setEvent(updatedEvent);
    }
  };

  const handleEndEvent = () => {
    if (tools.length > 0) {
      setEndEventModal(true);
    } else {
      confirmEndEvent();
    }
  };

  const confirmEndEvent = () => {
    const updatedEvent = endEvent(event.id);
    if (updatedEvent) {
      setEvent(updatedEvent);
    }
    setEndEventModal(false);
  };

  const handleToolAdded = (tool: Tool) => {
    setTools(prev => [tool, ...prev]);
  };

  const handleToolDeleted = (toolId: string) => {
    const success = deleteTool(toolId);
    if (success) {
      setTools(prev => prev.filter(tool => tool.id !== toolId));
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'not_started':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Event['status']) => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
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
                    <span className="text-sm text-muted-foreground">Assignment Letter:</span>
                    <p className="font-medium">{event.assignmentLetter}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(event.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                
                {event.startDate && (
                  <div>
                    <span className="text-sm text-muted-foreground">Started:</span>
                    <p className="font-medium text-green-600">
                      {format(new Date(event.startDate), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                
                {event.endDate && (
                  <div>
                    <span className="text-sm text-muted-foreground">Ended:</span>
                    <p className="font-medium text-gray-600">
                      {format(new Date(event.endDate), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 space-y-2">
                  {event.status === 'not_started' && (
                    <Button onClick={handleStartEvent} className="w-full bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Event
                    </Button>
                  )}
                  
                  {event.status === 'in_progress' && (
                    <Button onClick={handleEndEvent} variant="destructive" className="w-full">
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
              <h2 className="text-2xl font-semibold">Tools ({tools.length})</h2>
              {event.status !== 'completed' && (
                <AddToolModal eventId={event.id} onToolAdded={handleToolAdded} />
              )}
            </div>

            {tools.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    No tools assigned to this event yet.
                  </div>
                  {event.status !== 'completed' && (
                    <AddToolModal eventId={event.id} onToolAdded={handleToolAdded} />
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onDelete={handleToolDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <EndEventModal
          open={endEventModal}
          onOpenChange={setEndEventModal}
          tools={tools}
          onConfirm={confirmEndEvent}
        />
      </div>
    </div>
  );
}