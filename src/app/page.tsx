'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types';
import { getAllEvents, startEvent, endEvent } from '@/lib/events';
import { getToolsByEventId } from '@/lib/tools';
import EventCard from '@/components/EventCard';
import CreateEventModal from '@/components/CreateEventModal';
import EndEventModal from '@/components/EndEventModal';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [endEventModal, setEndEventModal] = useState<{ open: boolean; eventId: string | null }>({
    open: false,
    eventId: null,
  });

  useEffect(() => {
    setEvents(getAllEvents());
  }, []);

  const handleEventCreated = (event: Event) => {
    setEvents(prev => [event, ...prev]);
  };

  const handleStartEvent = (eventId: string) => {
    const updatedEvent = startEvent(eventId);
    if (updatedEvent) {
      setEvents(prev => prev.map(event => 
        event.id === eventId ? updatedEvent : event
      ));
    }
  };

  const handleEndEvent = (eventId: string) => {
    const tools = getToolsByEventId(eventId);
    if (tools.length > 0) {
      setEndEventModal({ open: true, eventId });
    } else {
      confirmEndEvent(eventId);
    }
  };

  const confirmEndEvent = (eventId: string) => {
    const updatedEvent = endEvent(eventId);
    if (updatedEvent) {
      setEvents(prev => prev.map(event => 
        event.id === eventId ? updatedEvent : event
      ));
    }
    setEndEventModal({ open: false, eventId: null });
  };

  const currentEvent = endEventModal.eventId ? 
    events.find(e => e.id === endEventModal.eventId) : null;
  const currentTools = currentEvent ? getToolsByEventId(currentEvent.id) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Logbook</h1>
            <p className="text-gray-600 mt-2">Manage your events and track tool conditions</p>
          </div>
          <CreateEventModal onEventCreated={handleEventCreated} />
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-4">Create your first event to get started</p>
              <CreateEventModal onEventCreated={handleEventCreated} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onStart={handleStartEvent}
                onEnd={handleEndEvent}
              />
            ))}
          </div>
        )}

        <EndEventModal
          open={endEventModal.open}
          onOpenChange={(open) => setEndEventModal({ open, eventId: null })}
          tools={currentTools}
          onConfirm={() => confirmEndEvent(endEventModal.eventId!)}
        />
      </div>
    </div>
  );
}