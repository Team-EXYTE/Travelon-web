import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  price: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  organizerId: string;
  organizerName: string;
  isEnded: boolean;
  participantsCount: number;
  status: string;
}

interface EventsData {
  events: Event[];
  total: number;
}

export function useEvents() {
  const [data, setData] = useState<EventsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/events');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, isEnded: boolean) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          isEnded
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      // Refresh the data
      await fetchEvents();
      return true;
    } catch (err: any) {
      console.error('Error updating event:', err);
      throw err;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      // Refresh the data
      await fetchEvents();
      return true;
    } catch (err: any) {
      console.error('Error deleting event:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchEvents,
    updateEventStatus,
    deleteEvent
  };
}
