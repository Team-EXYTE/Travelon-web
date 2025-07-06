"use client";

import React, { useState, useEffect, use } from "react"; // Add use to imports
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  Edit,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
}

export default function ViewEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use React.use() to unwrap params - future-proof approach
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/organizer/events/${eventId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch event: ${response.statusText}`);
        }
        const data = await response.json();
        setEvent(data.event);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]); // Use eventId instead of params.id

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handlePrevImage = () => {
    if (event?.images?.length) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? event.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (event?.images?.length) {
      setCurrentImageIndex((prev) => 
        prev === event.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertTriangle className="text-red-500 h-5 w-5 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">
              {error || "Event not found"}
            </p>
            <div className="mt-3">
              <button
                onClick={() => router.back()}
                className="text-sm font-medium text-red-800 hover:underline"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Events</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header with title and action buttons */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => router.push(`/organizer/events/edit/${event.id}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <Edit size={16} className="mr-2" />
                Edit Event
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <Tag className="h-3 w-3 mr-1" />
              {event.category}
            </span>

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
              <DollarSign className="h-3 w-3 mr-1" />
              {event.price === "0" ? "Free" : `LKR ${event.price}`}
            </span>

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-800">
              <Clock className="h-3 w-3 mr-1" />
              {event.isEnded ? "Ended" : "Upcoming"}
            </span>
          </div>
        </div>

        {/* Image gallery */}
        <div className="relative h-[400px] bg-gray-100">
          {event.images && event.images.length > 0 ? (
            <>
              <Image
                src={event.images[currentImageIndex]}
                alt={`${event.title} - image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              {event.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute top-1/2 left-4 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute top-1/2 right-4 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {event.images.map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white bg-opacity-50"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Image thumbnails */}
        {event.images && event.images.length > 1 && (
          <div className="p-4 border-t border-gray-200 overflow-x-auto">
            <div className="flex gap-2">
              {event.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative h-16 w-16 flex-shrink-0 border-2 rounded overflow-hidden ${
                    currentImageIndex === index
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${event.title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Event details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {event.description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Location Details</h2>
                <div className="flex items-start space-x-2 text-gray-700">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
                
                {/* Here you could add a map component using the coordinates */}
                <div className="mt-4 bg-gray-100 rounded-lg h-[200px] flex items-center justify-center">
                  <p className="text-gray-500">Map view would be displayed here using coordinates</p>
                  <p className="text-gray-500 text-xs mt-1">
                    ({event.latitude}, {event.longitude})
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-semibold mb-3">Event Details</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date & Time</p>
                      <p className="text-sm text-gray-700">{formatDate(event.date)}</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <DollarSign className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Price</p>
                      <p className="text-sm text-gray-700">
                        {event.price === "0" ? "Free Entry" : `LKR ${event.price}`}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <Tag className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Category</p>
                      <p className="text-sm text-gray-700">{event.category}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">Additional Information</h2>
                <ul className="mt-3 space-y-2">
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-800">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-500">Event ID</span>
                    <span className="text-gray-800 font-mono text-xs">{event.id}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${event.isEnded ? 'text-red-600' : 'text-green-600'}`}>
                      {event.isEnded ? 'Ended' : 'Active'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}