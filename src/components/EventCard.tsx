'use client';

import { Event } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play, Square, Eye } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
  onStart: (eventId: string) => void;
  onEnd: (eventId: string) => void;
}

export default function EventCard({ event, onStart, onEnd }: EventCardProps) {
  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'not_started':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'in_progress':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
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
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{event.name}</CardTitle>
          <Badge className={getStatusColor(event.status)}>
            {getStatusText(event.status)}
          </Badge>
        </div>
        {event.assignmentLetter && (
          <p className="text-sm text-muted-foreground">
            Assignment: {event.assignmentLetter}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Created: {format(new Date(event.createdAt), 'MMM dd, yyyy')}
          </div>
          
          {event.startDate && (
            <div className="text-sm text-muted-foreground">
              Started: {format(new Date(event.startDate), 'MMM dd, yyyy HH:mm')}
            </div>
          )}
          
          {event.endDate && (
            <div className="text-sm text-muted-foreground">
              Ended: {format(new Date(event.endDate), 'MMM dd, yyyy HH:mm')}
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Link href={`/events/${event.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </Link>
            
            {event.status === 'not_started' && (
              <Button 
                size="sm" 
                onClick={() => onStart(event.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            )}
            
            {event.status === 'in_progress' && (
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => onEnd(event.id)}
              >
                <Square className="w-4 h-4 mr-2" />
                End
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}