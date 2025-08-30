import { getAllEvents } from "@/services/events";
import EventCard from "@/app/(protected)/app/events/_components/event-card";
import CreateEventModal from "@/app/(protected)/app/events/_components/create-event-dialog";
import EndEventDialog from "@/app/(protected)/app/events/_components/end-event-dialog";

export default async function Home() {
  const events = await getAllEvents();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Event Logbook
        </h1>
        <CreateEventModal />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.length < 1 ? (
          <div>No data yet</div>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
      <EndEventDialog />
    </div>
  );
}
