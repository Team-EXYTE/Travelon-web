"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpCircle,
  Loader,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Calendar,
  Users,
  Zap,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  date: { seconds: number; nanoseconds: number } | string;
  price: string;
  location: string;
  category: string;
  eventType: string;
  maxParticipants: number;
  images: string[];
  isBoosted?: boolean;
  isEnded?: boolean;
}

interface BoostPaymentDetails {
  serviceFee: number;
  totalAmount: number;
  externalTrxId: string | null;
  timeStamp: string | null;
}

// Update the formatEventDate function to display in the required format:

function formatEventDate(
  dateInput: { seconds: number; nanoseconds: number } | string | undefined
): string {
  if (!dateInput) {
    return "Date not available";
  }

  try {
    let date: Date;

    // Handle Firebase Timestamp object
    if (typeof dateInput === "object" && "seconds" in dateInput) {
      date = new Date(dateInput.seconds * 1000);
    }
    // Handle ISO string
    else if (typeof dateInput === "string") {
      date = new Date(dateInput);
    }
    // Handle unknown format
    else {
      return "Invalid date format";
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Format the date
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    // Format the main date part
    const formattedDate = date.toLocaleDateString("en-US", options);

    // Get timezone offset in hours and minutes
    const offset = date.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMinutes = Math.abs(offset % 60);

    // Create timezone string like "UTC+5:30" or "UTC-5:30"
    const timezoneString = `UTC${
      offset <= 0 ? "+" : "-"
    }${offsetHours}:${offsetMinutes.toString().padStart(2, "0")}`;

    // Combine all parts
    return `${formattedDate} ${timezoneString}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
}

export default function BoostEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<BoostPaymentDetails>({
    serviceFee: 0,
    totalAmount: 0,
    externalTrxId: null,
    timeStamp: null,
  });

  // Fetch organizer's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/organizer/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        console.log("Fetched events date:", data.events[0]?.date);
        setEvents(data.events);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    // Reset payment states when selecting a new event
    setPaymentStatus("idle");
    setPaymentError(null);
  };

  const calculateBoostFee = (event: Event): number => {
    const ticketPrice = parseFloat(event.price) || 0;
    const maxParticipants = event.maxParticipants || 100;
    // Calculate 5% of potential revenue
    return Math.ceil(ticketPrice * maxParticipants * 0.05);
  };

  const processBoostPayment = async () => {
    if (!selectedEvent) return;

    try {
      setPaymentProcessing(true);
      setPaymentStatus("processing");
      setPaymentError(null);

      // Get user authentication data
      const authResponse = await fetch("/api/auth/me");
      if (!authResponse.ok) {
        throw new Error("Authentication failed. Please log in again.");
      }

      const authData = await authResponse.json();
      const userId = authData.user?.uid;

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      // Calculate boost fee (5% of maximum participants * ticket price)
      const boostFee = calculateBoostFee(selectedEvent);

      // Don't proceed if the event is free or the fee is too low
      if (boostFee <= 0) {
        // For free events, request boost without payment
        const requestResponse = await fetch(
          "/api/organizer/events/boost-request",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId: selectedEvent.id,
              userId,
              freeEvent: true,
            }),
          }
        );

        if (!requestResponse.ok) {
          const errorData = await requestResponse.json();
          throw new Error(
            errorData.message || "Failed to request boost for free event"
          );
        }

        setPaymentStatus("success");
        setPaymentDetails({
          serviceFee: 0,
          totalAmount: 0,
          externalTrxId: "free-event-boost",
          timeStamp: new Date().toISOString(),
        });
        return;
      }

      // Make payment request to our API for paid events
      const response = await fetch("/api/organizer/events/boost-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: boostFee.toString(),
          userId,
          eventId: selectedEvent.id,
          eventDetails: {
            title: selectedEvent.title,
            price: selectedEvent.price,
            maxParticipants: selectedEvent.maxParticipants,
            eventType: selectedEvent.eventType,
          },
        }),
      });

      const paymentData = await response.json();

      if (!response.ok) {
        throw new Error(
          paymentData.statusDetail || "Payment failed. Please try again."
        );
      }

      if (paymentData.success && paymentData.statusCode === "S1000") {
        setPaymentStatus("success");
        setPaymentDetails({
          serviceFee: boostFee,
          totalAmount: boostFee,
          externalTrxId: paymentData.externalTrxId,
          timeStamp: paymentData.timeStamp,
        });

        // Update local state to reflect the boosted status
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id
              ? { ...event, isBoosted: true }
              : event
          )
        );
      } else {
        throw new Error(
          paymentData.statusDetail || "Payment failed. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Boost payment error:", error);
      setPaymentStatus("error");
      setPaymentError(error.message || "Payment failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Boost Your Events</h1>
        <p className="text-gray-600">
          Increase visibility and reach more potential attendees by boosting
          your events. Boosted events will be promoted via SMS messages sent to
          subscribed travellers using our app.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-blue-800">Boost Information</h3>
            <p className="text-sm text-blue-600 mt-1">
              Boosting an event costs 5% of your event&apos;s potential revenue
              (ticket price × max participants). Boosted events will be sent to
              travelers once approved by the admin.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-3 text-lg text-gray-600">
            Loading your events...
          </span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Failed to load events
          </h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No events found
          </h3>
          <p className="text-gray-500 mb-4">
            You haven&apos;t created any events yet.
          </p>
          <Link
            href="/organizer/create-event"
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Create Your First Event <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Your Events</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedEvent?.id === event.id ? "ring-2 ring-blue-500" : ""
                  } ${
                    event.isBoosted
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleSelectEvent(event)}
                >
                  <div className="aspect-w-16 aspect-h-9 relative h-40 bg-gray-100">
                    {event.images && event.images.length > 0 ? (
                      <Image
                        src={event.images[0]}
                        alt={event.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Calendar className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {event.isBoosted && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        Boosted
                      </div>
                    )}
                    {event.isEnded && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Ended
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 truncate">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatEventDate(event.date)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{event.maxParticipants || "Unlimited"}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {parseFloat(event.price) > 0
                          ? `LKR ${event.price}`
                          : "Free"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
            {!selectedEvent ? (
              <div className="text-center py-8">
                <ArrowUpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Select an Event
                </h3>
                <p className="text-gray-500 text-sm">
                  Choose an event from the list to see boost options
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-xl border-b border-gray-200 pb-3 mb-4">
                  Boost &quot;{selectedEvent.title}&quot;
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Event Type:</span>
                    <span className="font-medium capitalize">
                      {selectedEvent.eventType || "Standard"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ticket Price:</span>
                    <span className="font-medium">
                      {parseFloat(selectedEvent.price) > 0
                        ? `LKR ${selectedEvent.price}`
                        : "Free"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Maximum Participants:</span>
                    <span className="font-medium">
                      {selectedEvent.maxParticipants || "Unlimited"}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 my-2 pt-2"></div>

                  <div className="flex justify-between">
                    <span className="text-gray-700">Boost Fee (5%):</span>
                    <span className="font-bold">
                      LKR {calculateBoostFee(selectedEvent)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    The boost fee is 5% of the maximum potential revenue (Ticket
                    Price × Max Participants)
                  </p>
                </div>

                {selectedEvent.isBoosted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-green-800">
                          Already Boosted
                        </h4>
                        <p className="text-sm text-green-600">
                          This event is currently being promoted to travelers
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {paymentStatus === "idle" && (
                      <button
                        type="button"
                        onClick={processBoostPayment}
                        disabled={paymentProcessing || selectedEvent.isEnded}
                        className={`w-full px-4 py-3 text-white rounded-lg flex items-center justify-center ${
                          selectedEvent.isEnded
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 transition-colors"
                        }`}
                      >
                        {paymentProcessing ? (
                          <>
                            <Loader size={16} className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : selectedEvent.isEnded ? (
                          <>
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            Event Has Ended
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 mr-2" />
                            Boost This Event
                          </>
                        )}
                      </button>
                    )}

                    {paymentStatus === "processing" && (
                      <div className="flex flex-col items-center py-6">
                        <Loader
                          size={32}
                          className="animate-spin mb-4 text-blue-600"
                        />
                        <p className="text-gray-700">Processing payment...</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Please do not close this page
                        </p>
                      </div>
                    )}

                    {paymentStatus === "success" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 mr-3" />
                          <div>
                            <h4 className="font-medium text-green-800">
                              Boost Request Successful
                            </h4>
                            <p className="text-sm text-green-600 mt-1">
                              Your boost request has been submitted and is
                              awaiting admin approval.
                            </p>
                            {paymentDetails.externalTrxId &&
                              paymentDetails.externalTrxId !==
                                "free-event-boost" && (
                                <p className="text-xs text-green-700 mt-2">
                                  Transaction ID: {paymentDetails.externalTrxId}
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentStatus === "error" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5 mr-3" />
                          <div>
                            <h4 className="font-medium text-red-800">
                              Payment Failed
                            </h4>
                            <p className="text-sm text-red-600 mt-1">
                              {paymentError ||
                                "There was an error processing your payment. Please try again."}
                            </p>
                            <button
                              type="button"
                              onClick={processBoostPayment}
                              disabled={paymentProcessing}
                              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                            >
                              Try Again
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
