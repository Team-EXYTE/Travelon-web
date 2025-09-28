"use client";

import React, { useState, useEffect } from "react";
import { Search, MoreHorizontal, CheckCircle, XCircle, Calendar, Users } from "lucide-react";
import Image from "next/image";

interface Payment {
  id: string;
  eventId: string;
  organizerId: string;
  paymentStatus: "Completed" | "Pending" | "Ongoing";
  createdAt: string;
  // These are populated from events collection
  eventName?: string;
  participantCount?: number;
  ticketPrice?: number;
  images?: string[];
  // These may be populated from users collection
  organizerName?: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for payment details modal
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // State for action dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/payments");
        if (!response.ok) {
          throw new Error("Failed to fetch payments");
        }
        const data = await response.json();
        setPayments(Array.isArray(data.payments) ? data.payments : []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Apply filters whenever filterStatus or searchTerm changes
  useEffect(() => {
    let result = [...payments];
    
    // Filter by status
    if (filterStatus !== "all") {
      result = result.filter(payment => 
        payment.paymentStatus.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        payment => 
          (payment.eventName?.toLowerCase().includes(term) || false) || 
          (payment.organizerName && payment.organizerName.toLowerCase().includes(term))
      );
    }
    
    setFilteredPayments(result);
  }, [payments, filterStatus, searchTerm]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Toggle dropdown visibility
  const toggleDropdown = (paymentId: string) => {
    if (openDropdownId === paymentId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(paymentId);
    }
  };

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  // Open payment details modal
  const openPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentModalOpen(true);
  };

  // Close payment details modal
  const closePaymentModal = () => {
    setSelectedPayment(null);
    setIsPaymentModalOpen(false);
  };

  // Update payment status
  const updatePaymentStatus = async (paymentId: string, newStatus: "Completed" | "Pending" | "Ongoing") => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      // Update local state
      setPayments(payments.map(payment => 
        payment.id === paymentId ? { ...payment, paymentStatus: newStatus } : payment
      ));
      
      // Close dropdown
      setOpenDropdownId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    Completed: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Ongoing: "bg-blue-100 text-blue-800",
  };

  return (
    <div onClick={closeDropdown}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Payments</h1>
          <p className="text-gray-600 mt-1">Manage event payments on the platform</p>
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
            placeholder="Search payments..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
          </select>
          <button 
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => {
              setFilterStatus("all");
              setSearchTerm("");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organizer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participants
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openPaymentModal(payment)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden">
                        <Image 
                          src={payment.images && payment.images.length > 0 ? payment.images[0] : "/Sigiriya.jpg"} 
                          alt={payment.eventName || "Event image"}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{payment.eventName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {payment.eventId.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.organizerName || "Unknown Organizer"}</div>
                    <div className="text-xs text-gray-500">ID: {payment.organizerId.substring(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(payment.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Users size={14} className="mr-1" /> {payment.participantCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Rs. {(payment.ticketPrice || 0) * (payment.participantCount || 0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Rs. {payment.ticketPrice || 0} per ticket
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[payment.paymentStatus]}`}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button 
                          className="p-1 text-gray-500 hover:text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(payment.id);
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        
                        {/* Dropdown menu */}
                        {openDropdownId === payment.id && (
                          <div 
                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="py-1">
                              {payment.paymentStatus !== "Completed" && (
                                <button
                                  onClick={() => updatePaymentStatus(payment.id, "Completed")}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <CheckCircle size={16} className="mr-2 text-green-500" />
                                  Mark as Completed
                                </button>
                              )}
                              {payment.paymentStatus !== "Pending" && (
                                <button
                                  onClick={() => updatePaymentStatus(payment.id, "Pending")}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <XCircle size={16} className="mr-2 text-yellow-500" />
                                  Mark as Pending
                                </button>
                              )}
                              {payment.paymentStatus !== "Ongoing" && (
                                <button
                                  onClick={() => updatePaymentStatus(payment.id, "Ongoing")}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Calendar size={16} className="mr-2 text-blue-500" />
                                  Mark as Ongoing
                                </button>
                              )}
                              <button 
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => openPaymentModal(payment)}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPayments.length}</span> of <span className="font-medium">{filteredPayments.length}</span> results
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

      {/* Payment Details Modal */}
      {isPaymentModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={closePaymentModal}>
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Payment Image */}
            {selectedPayment.images && selectedPayment.images.length > 0 ? (
              <div className="relative w-full h-64 rounded-t-lg overflow-hidden bg-gray-200">
                <Image 
                  src={selectedPayment.images[0]} 
                  alt={selectedPayment.eventName || "Event image"}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={closePaymentModal}
                    className="bg-white rounded-full p-2 hover:bg-gray-100 shadow-lg"
                  >
                    <XCircle size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-64 rounded-t-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500">No image available</div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={closePaymentModal}
                    className="bg-white rounded-full p-2 hover:bg-gray-100 shadow-lg"
                  >
                    <XCircle size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="p-6">
              {/* Payment Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-2">{selectedPayment.eventName || "Unknown Event"}</h2>
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusStyles[selectedPayment.paymentStatus]}`}>
                      {selectedPayment.paymentStatus}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-black">Rs. {(selectedPayment.ticketPrice || 0) * (selectedPayment.participantCount || 0)}</div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                  </div>
                </div>
              </div>

              {/* Payment Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Payment Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Date & Time:</span>
                      <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Ticket Price:</span>
                      <p className="font-medium">Rs. {selectedPayment.ticketPrice || 0} per person</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Participants:</span>
                      <p className="font-medium flex items-center">
                        <Users size={16} className="mr-1" /> {selectedPayment.participantCount || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Total Amount:</span>
                      <p className="font-medium">Rs. {(selectedPayment.ticketPrice || 0) * (selectedPayment.participantCount || 0)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Admin Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Payment ID:</span>
                      <p className="font-medium font-mono text-xs">{selectedPayment.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Event ID:</span>
                      <p className="font-medium font-mono text-xs">{selectedPayment.eventId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Organizer ID:</span>
                      <p className="font-medium font-mono text-xs">{selectedPayment.organizerId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Status:</span>
                      <p className="font-medium">{selectedPayment.paymentStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closePaymentModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
                >
                  Close
                </button>
                
                {selectedPayment.paymentStatus !== "Completed" && (
                  <button
                    onClick={() => {
                      updatePaymentStatus(selectedPayment.id, "Completed");
                      closePaymentModal();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none"
                  >
                    Mark as Completed
                  </button>
                )}
                
                {selectedPayment.paymentStatus === "Ongoing" && (
                  <button
                    onClick={() => {
                      updatePaymentStatus(selectedPayment.id, "Pending");
                      closePaymentModal();
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none"
                  >
                    Mark as Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
