import { getAllEvents } from "@/services/events";
import EventCard from "@/app/(protected)/app/events/_components/event-card";
import CreateEventModal from "@/app/(protected)/app/events/_components/create-event-dialog";
import EndEventDialog from "@/app/(protected)/app/events/_components/end-event-dialog";

export default async function Home() {
  const events = await getAllEvents();

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
        <EndEventDialog />
      </div>
    </div>
  );
}
