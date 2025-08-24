// 'use client';

// import { useState, useEffect } from 'react';
import { Event } from "@/types";
import { getAllEvents, startEvent, endEvent } from "@/services/events";
import { getToolsByEventId } from "@/services/tools";
import EventCard from "@/app/(protected)/app/events/_components/event-card";
import CreateEventModal from "@/app/(protected)/app/events/_components/create-event-dialog";
import EndEventDialog from "@/app/(protected)/app/events/_components/end-event-dialog";

export default async function Home() {
  const events = await getAllEvents();
  // console.log(events);

  // const [events, setEvents] = useState<Event[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [endEventModal, setEndEventModal] = useState<{ open: boolean; eventId: string | null }>({
  //   open: false,
  //   eventId: null,
  // });
  // const [currentTools, setCurrentTools] = useState<any[]>([]);

  // useEffect(() => {
  //   loadEvents();
  // }, []);

  // const loadEvents = async () => {
  //   try {
  //     const allEvents = await getAllEvents();
  //     setEvents(allEvents);
  //   } catch (error) {
  //     console.error('Error loading events:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleEventCreated = async (event: Event) => {
  //   setEvents(prev => [event, ...prev]);
  // };

  // const handleEndEvent = async (eventId: string) => {
  //   try {
  //     const tools = await getToolsByEventId(eventId);
  //     if (tools.length > 0) {
  //       setEndEventModal({ open: true, eventId });
  //       setCurrentTools(tools);
  //     } else {
  //       await confirmEndEvent(eventId);
  //     }
  //   } catch (error) {
  //     console.error('Error handling end event:', error);
  //   }
  // };

  // const confirmEndEvent = async (eventId: string) => {
  //   try {
  //     const updatedEvent = await endEvent(eventId);
  //     if (updatedEvent) {
  //       setEvents(prev => prev.map(event =>
  //         event.id === eventId ? updatedEvent : event
  //       ));
  //     }
  //     setEndEventModal({ open: false, eventId: null });
  //     setCurrentTools([]);
  //   } catch (error) {
  //     console.error('Error ending event:', error);
  //   }
  // };

  // const currentEvent = endEventModal.eventId ?
  //   events.find(e => e.id === endEventModal.eventId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Logbook</h1>
            <p className="text-gray-600 mt-2">
              Manage your events and track tool conditions
            </p>
          </div>
          <CreateEventModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length < 1 ? (
            <div>No data yet</div>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>

        {/* {loading ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading events...</h3>
              <p className="text-gray-600">Please wait while we load your events</p>
            </div>
          </div>
        ) : events.length === 0 ? (
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

        */}
        <EndEventDialog tools={events[0].tools} />
      </div>
    </div>
  );
}
