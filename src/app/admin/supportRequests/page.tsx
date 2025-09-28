"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Filter,
  Calendar,
  Mail,
  User,
  Tag,
  MessageSquare,
  X
} from "lucide-react";
import Image from "next/image";

// Interface for support request data
interface SupportRequest {
  id: string;
  categoryName: string;
  createdAt: string;
  message: string;
  status: string;
  subject: string;
  userEmail: string;
  userId: string;
}

export default function SupportRequestPage() {
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    request: SupportRequest | null;
  }>({
    isOpen: false,
    request: null,
  });

  // Fetch support requests
  useEffect(() => {
    const fetchSupportRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/supportRequests");
        if (!response.ok) {
          throw new Error("Failed to fetch support requests");
        }
        const data = await response.json();
        setSupportRequests(data.supportRequests);
        setError(null);
      } catch (error) {
        console.error("Error fetching support requests:", error);
        setError("Failed to load support requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupportRequests();
  }, []);

  // Filter support requests based on search term and filters
  const filteredRequests = supportRequests.filter((request) => {
    const matchesSearch =
      searchTerm === "" ||
      request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" || request.categoryName === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Format date string
  const formatDate = (dateString: string) => {
    try {
      // Check if dateString is valid
      if (!dateString) return "No date available";
      
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  // Open detail modal
  const openDetailModal = (request: SupportRequest) => {
    setDetailModal({
      isOpen: true,
      request,
    });
  };

  // Close detail modal
  const closeDetailModal = () => {
    setDetailModal({
      isOpen: false,
      request: null,
    });
  };

  // Update request status
  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/supportRequests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      // Update UI
      setSupportRequests(
        supportRequests.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );

      // Update detail modal if it's open
      if (detailModal.request?.id === requestId) {
        setDetailModal({
          ...detailModal,
          request: { ...detailModal.request, status: newStatus },
        });
      }

    } catch (error: any) {
      console.error("Error updating status:", error);
      setError(error.message || "Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for filter
  const categories = [
    "all",
    ...Array.from(
      new Set(supportRequests.map((req) => req.categoryName))
    ),
  ];

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      inProgress: "bg-blue-100 text-blue-800",
      closed: "bg-gray-100 text-gray-800",
    } as Record<string, string>;

    const statusClass = statusClasses[status as keyof typeof statusClasses] || statusClasses.pending;

    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Support Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage and respond to user support requests
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="inProgress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          {/* <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== "all").map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select> */}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading support requests...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRequests.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Support Requests Found
          </h3>
          <p className="text-gray-600 mb-4">
            {supportRequests.length === 0
              ? "There are no support requests in the system yet."
              : "No support requests match your current filters."}
          </p>
          {supportRequests.length > 0 && (
            <button
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
            >
              <Filter size={18} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Support Requests Table */}
      {!loading && !error && filteredRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Subject
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openDetailModal(request)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {request.subject}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail size={14} className="mr-1" /> {request.userEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Tag size={14} className="mr-1" /> {request.categoryName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar size={14} className="mr-1" />{" "}
                      {formatDate(request.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1 text-gray-500 hover:text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailModal(request);
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{filteredRequests.length}</span> of{" "}
              <span className="font-medium">{filteredRequests.length}</span>{" "}
              results
            </div>
            <div className="flex gap-1">
              <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-md">
                Previous
              </button>
              <button className="bg-black border border-black text-white hover:bg-gray-800 px-4 py-2 text-sm font-medium rounded-md">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.request && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Support Request Details
              </h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="text-xl font-semibold mb-2">
                {detailModal.request.subject}
              </h4>
              <div className="flex flex-wrap gap-3 mb-4">
                <StatusBadge status={detailModal.request.status} />
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(detailModal.request.createdAt)}
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <Tag size={14} className="mr-1" />
                  {detailModal.request.categoryName}
                </span>
              </div>

              <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-md">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <User size={16} className="text-gray-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {detailModal.request.userEmail}
                  </div>
                  <div className="text-xs text-gray-500">
                    User ID: {detailModal.request.userId}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Message</h4>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                {detailModal.request.message}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Update Status
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateStatus(detailModal.request!.id, "pending")}
                  className={`px-3 py-2 text-xs font-medium rounded-md ${
                    detailModal.request.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800 hover:bg-yellow-50 hover:text-yellow-800"
                  }`}
                  disabled={detailModal.request.status === "pending"}
                >
                  <Clock size={14} className="inline mr-1" />
                  Pending
                </button>
                <button
                  onClick={() => updateStatus(detailModal.request!.id, "inProgress")}
                  className={`px-3 py-2 text-xs font-medium rounded-md ${
                    detailModal.request.status === "inProgress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800 hover:bg-blue-50 hover:text-blue-800"
                  }`}
                  disabled={detailModal.request.status === "inProgress"}
                >
                  <Clock size={14} className="inline mr-1" />
                  In Progress
                </button>
                <button
                  onClick={() => updateStatus(detailModal.request!.id, "resolved")}
                  className={`px-3 py-2 text-xs font-medium rounded-md ${
                    detailModal.request.status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800 hover:bg-green-50 hover:text-green-800"
                  }`}
                  disabled={detailModal.request.status === "resolved"}
                >
                  <CheckCircle2 size={14} className="inline mr-1" />
                  Resolved
                </button>
                <button
                  onClick={() => updateStatus(detailModal.request!.id, "closed")}
                  className={`px-3 py-2 text-xs font-medium rounded-md ${
                    detailModal.request.status === "closed"
                      ? "bg-gray-300 text-gray-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  disabled={detailModal.request.status === "closed"}
                >
                  <X size={14} className="inline mr-1" />
                  Closed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
