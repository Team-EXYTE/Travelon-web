"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Tag,
  Edit,
  Trash2,
  Plus,
  Loader,
  AlertTriangle,
  Eye,
  Users,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EventData {
  id: string;
  title: string;
  price: string;
  category: string;
  description: string;
  location: string;
  date: string;
  latitude: number;
  longitude: number;
  images: string[];
  isEnded: boolean;
  createdAt: string;
  organizerId: string;
  maxParticipants?: number;
}

const EventsPage = () => {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/organizer/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching events");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizer/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Remove deleted event from state
      setEvents(events.filter((event) => event.id !== eventId));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the event");
      console.error("Error deleting event:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        <p className="ml-2 text-gray-600">Loading your events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertTriangle className="text-red-500 h-5 w-5 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-800 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Events</h1>
        <Link href="/organizer/create-event">
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Plus size={16} />
            Create Event
          </button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Events Yet
          </h2>
          <p className="text-gray-600 mb-6">
            You haven&apos;t created any events yet. Start by creating your
            first event.
          </p>
          <Link href="/organizer/create-event">
            <button className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
              <Plus size={16} />
              Create Your First Event
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Event image */}
                <div className="relative h-48">
                  {event.images && event.images.length > 0 ? (
                    <Image
                      src={event.images[0]}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {event.isEnded && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1">
                      ENDED
                    </div>
                  )}
                </div>

                {/* Event details */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
                    {event.title}
                  </h3>

                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(event.date)}</span>
                  </div>

                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  <div className="flex items-center mt-2 text-xs text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span>
                      {event.maxParticipants
                        ? `Capacity: ${event.maxParticipants}`
                        : "Open to everyone"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <Tag className="h-3 w-3 mr-1" />
                      {event.category}
                    </span>

                    <span className="text-sm font-medium">
                      {event.price === "0" ? "Free" : `LKR ${event.price}`}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-3 gap-1">
                    <button
                      className="flex flex-col items-center justify-center py-2 text-gray-600 hover:bg-gray-50 rounded"
                      onClick={() =>
                        router.push(`/organizer/events/view/${event.id}`)
                      }
                    >
                      <Eye size={16} />
                      <span className="text-xs mt-1">View</span>
                    </button>
                    <button
                      className="flex flex-col items-center justify-center py-2 text-gray-600 hover:bg-gray-50 rounded"
                      onClick={() =>
                        router.push(`/organizer/events/edit/${event.id}`)
                      }
                    >
                      <Edit size={16} />
                      <span className="text-xs mt-1">Edit</span>
                    </button>
                    <button
                      className="flex flex-col items-center justify-center py-2 text-gray-600 hover:bg-gray-50 rounded"
                      onClick={() => setShowDeleteConfirm(event.id)}
                    >
                      <Trash2 size={16} />
                      <span className="text-xs mt-1">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics summary */}
          <div className="mt-12 bg-gray-50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-medium">
                  Total Events
                </h3>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{events.length}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-medium">
                  Upcoming Events
                </h3>
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold mt-2">
                {events.filter((event) => !event.isEnded).length}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-medium">
                  Past Events
                </h3>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold mt-2">
                {events.filter((event) => event.isEnded).length}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/4 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  showDeleteConfirm && handleDeleteEvent(showDeleteConfirm)
                }
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
