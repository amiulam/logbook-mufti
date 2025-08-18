'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { createEvent } from '@/lib/events';
import { Event } from '@/types';

interface CreateEventModalProps {
  onEventCreated: (event: Event) => void;
}

export default function CreateEventModal({ onEventCreated }: CreateEventModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [assignmentLetter, setAssignmentLetter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const event = createEvent({
      name: name.trim(),
      assignmentLetter: assignmentLetter.trim() || undefined,
      status: 'not_started',
    });
    
    onEventCreated(event);
    setOpen(false);
    setName('');
    setAssignmentLetter('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter event name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment">Assignment Letter</Label>
            <Input
              id="assignment"
              value={assignmentLetter}
              onChange={(e) => setAssignmentLetter(e.target.value)}
              placeholder="Enter assignment letter (optional)"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}