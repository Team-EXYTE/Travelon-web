import { useState, useEffect } from 'react';

interface Organizer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  orgName: string;
  address: string;
  district: string;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  username: string;
  updatedAt: string;
  eventCount: number;
  status: string;
}

interface OrganizersData {
  organizers: Organizer[];
  total: number;
}

export function useOrganizers() {
  const [data, setData] = useState<OrganizersData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/organizers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizers');
      }
      
      const result = await response.json();
      setData(result);
      console.log('Fetched organizers:', result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching organizers:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizerStatus = async (organizerId: string, phoneNumberVerified: boolean) => {
    try {
      const response = await fetch('/api/admin/organizers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizerId,
          phoneNumberVerified
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update organizer');
      }

      // Refresh the data
      await fetchOrganizers();
      return true;
    } catch (err: any) {
      console.error('Error updating organizer:', err);
      throw err;
    }
  };

  const deleteOrganizer = async (organizerId: string) => {
    try {
      const response = await fetch('/api/admin/organizers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizerId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete organizer');
      }

      // Refresh the data
      await fetchOrganizers();
      return true;
    } catch (err: any) {
      console.error('Error deleting organizer:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchOrganizers,
    updateOrganizerStatus,
    deleteOrganizer
  };
}
