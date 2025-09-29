"use client";

import { useState, useEffect } from "react";
import {
  Loader,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageCircle,
  User,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BoostRequest {
  id: string;
  eventId: string;
  userId: string;
  paymentId: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  amount: string;
  eventTitle: string;
  eventImage?: string;
  organizerName?: string;
  eventDate?: string;
  eventLocation?: string;
}

interface Payment {
  externalTrxId: string;
  status: string;
  amount: string;
  timeStamp: string;
}

export default function BoostRequestsPage() {
  const [requests, setRequests] = useState<BoostRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<{
    id: string;
    status: "idle" | "sending" | "success" | "error";
    message?: string;
  } | null>(null);

  // Fetch all boost requests
  useEffect(() => {
    const fetchBoostRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/boost-requests");
        if (!response.ok) {
          throw new Error("Failed to fetch boost requests");
        }

        const data = await response.json();
        setRequests(data.requests);
      } catch (err: any) {
        console.error("Error fetching boost requests:", err);
        setError(err.message || "Failed to load boost requests");
      } finally {
        setLoading(false);
      }
    };

    fetchBoostRequests();
  }, []);

  // Handle approve request
  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessingId(requestId);

      const response = await fetch(
        `/api/admin/boost-requests/${requestId}/approve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve request");
      }

      // Update local state
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "approved" }
            : request
        )
      );

      // Set notification status to show the SMS notification was sent
      setNotificationStatus({
        id: requestId,
        status: "success",
        message: "Event boosted and notifications sent to subscribers",
      });
    } catch (err: any) {
      console.error("Error approving request:", err);
      setNotificationStatus({
        id: requestId,
        status: "error",
        message: err.message || "Failed to approve request",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Handle reject request
  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingId(requestId);

      const response = await fetch(
        `/api/admin/boost-requests/${requestId}/reject`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject request");
      }

      // Update local state
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "rejected" }
            : request
        )
      );
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      alert(err.message || "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Event Boost Requests</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="h-10 w-10 animate-spin text-gray-500" />
          <span className="ml-3 text-lg text-gray-600">
            Loading requests...
          </span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Failed to load requests
          </h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No boost requests
          </h3>
          <p className="text-gray-500">
            There are currently no event boost requests to process.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Event
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Organizer
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Amount
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Requested At
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Status
                </th>
                <th className="py-3 px-4 text-center font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {request.eventImage ? (
                        <div className="w-10 h-10 rounded overflow-hidden mr-3">
                          <Image
                            src={request.eventImage}
                            alt={request.eventTitle}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-800">
                          <Link
                            href={`/admin/events`}
                            className="hover:underline"
                          >
                            {request.eventTitle}
                          </Link>
                        </div>
                        {request.eventLocation && (
                          <div className="text-xs text-gray-500">
                            {request.eventLocation}
                          </div>
                        )}
                        {request.eventDate && (
                          <div className="text-xs text-gray-500">
                            {request.eventDate}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <Link
                        href={`/admin/organizers`}
                        className="hover:underline"
                      >
                        {request.organizerName || "Unknown Organizer"}
                      </Link>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium">
                      {request.amount ? `LKR ${request.amount}` : "Free"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {formatDate(request.requestedAt)}
                  </td>
                  <td className="py-4 px-4">
                    {request.status === "pending" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    ) : request.status === "approved" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      {request.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={processingId === request.id}
                            className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            title="Approve"
                          >
                            {processingId === request.id ? (
                              <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                              <CheckCircle className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={processingId === request.id}
                            className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {request.status === "approved"
                            ? "Approved"
                            : "Rejected"}
                        </div>
                      )}
                    </div>

                    {/* Notification status indicator */}
                    {notificationStatus &&
                      notificationStatus.id === request.id && (
                        <div
                          className={`mt-2 text-xs p-1 rounded flex items-center ${
                            notificationStatus.status === "sending"
                              ? "bg-blue-100 text-blue-700"
                              : notificationStatus.status === "success"
                              ? "bg-green-100 text-green-700"
                              : notificationStatus.status === "error"
                              ? "bg-red-100 text-red-700"
                              : ""
                          }`}
                        >
                          {notificationStatus.status === "sending" && (
                            <Loader className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {notificationStatus.status === "success" && (
                            <MessageCircle className="h-3 w-3 mr-1" />
                          )}
                          {notificationStatus.status === "error" && (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          <span>{notificationStatus.message}</span>
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
