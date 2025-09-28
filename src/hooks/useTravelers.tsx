import { useState, useEffect } from 'react';

interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  joinDate: string;
  eventCount: number;
  status: string;
  bookings?: string[];
}

interface TravelersData {
  travelers: Traveler[];
  total: number;
}

export function useTravelers() {
  const [data, setData] = useState<TravelersData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTravelers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/travellers');
      if (!response.ok) {
        throw new Error('Failed to fetch travelers');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching travelers:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTraveler = async (travelerId: string) => {
    try {
      const response = await fetch('/api/admin/travellers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ travelerId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete traveler');
      }
      await fetchTravelers();
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting traveler:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTravelers();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchTravelers,
    deleteTraveler,
  };
}
