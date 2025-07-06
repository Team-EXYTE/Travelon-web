"use client";

import React, { useState } from "react";
import {  Search, MoreHorizontal, Edit, Trash2, MapPin, Users, AlertTriangle } from "lucide-react";
import Image from "next/image";
// Calendar, Plus,
export default function EventsPage() {
  // Sample event data with photos
  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: "Kandy Cultural Tour", 
      organizer: "Adventure Lanka Tours", 
      location: "Kandy, Sri Lanka", 
      date: "2025-07-15", 
      participants: 28, 
      status: "Active",
      photo: "/Sigiriya.jpg" // Example local image path
    },
    { 
      id: 2, 
      title: "Colombo City Walk", 
      organizer: "Colombo Experiences", 
      location: "Colombo, Sri Lanka", 
      date: "2025-07-20", 
      participants: 12, 
      status: "Active",
      photo: "/Sigiriya.jpg"
     },
    { 
      id: 3, 
      title: "Tea Plantation Visit", 
      organizer: "Sri Lanka Journeys", 
      location: "Nuwara Eliya, Sri Lanka", 
      date: "2025-08-05", 
      participants: 8, 
      status: "Upcoming",
      photo: "/Sigiriya.jpg"
    },
    { 
      id: 4, 
      title: "Sigiriya Rock Fortress Trek", 
      organizer: "Adventure Lanka Tours", 
      location: "Sigiriya, Sri Lanka", 
      date: "2025-08-12", 
      participants: 15, 
      status: "Upcoming",
      photo: "/Sigiriya.jpg"
    },
    { 
      id: 5, 
      title: "Galle Fort Exploration", 
      organizer: "Beach Paradise Tours", 
      location: "Galle, Sri Lanka", 
      date: "2025-06-20", 
      participants: 22, 
      status: "Completed",
      photo: "/Sigiriya.jpg"
    },
  ]);

  // State for delete confirmation modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    eventId: number | null;
    eventTitle: string;
    eventPhoto: string;
  }>({
    isOpen: false,
    eventId: null,
    eventTitle: "",
    eventPhoto: ""
  });

  // Open delete confirmation
  const openDeleteConfirmation = (eventId: number, eventTitle: string, eventPhoto: string) => {
    setDeleteConfirmation({
      isOpen: true,
      eventId,
      eventTitle,
      eventPhoto
    });
  };

  // Close delete confirmation
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      eventId: null,
      eventTitle: "",
      eventPhoto: ""
    });
  };

  // Delete event
  const deleteEvent = () => {
    if (deleteConfirmation.eventId) {
      setEvents(events.filter(event => event.id !== deleteConfirmation.eventId));
      closeDeleteConfirmation();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Events</h1>
          <p className="text-gray-600 mt-1">Manage events hosted on the platform</p>
        </div>
        {/* <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={18} />
          <span>Add Event</span>
        </button> */}
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </select>
          <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Filter
          </button>
        </div>
      </div>

      {/* Events table */}
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
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden">
                      <Image 
                        src={event.photo} 
                        alt={event.title}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin size={12} className="mr-1" /> {event.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{event.organizer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Users size={14} className="mr-1" /> {event.participants}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${event.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 text-gray-500 hover:text-black">
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-1 text-gray-500 hover:text-red-500"
                      onClick={() => openDeleteConfirmation(event.id, event.title, event.photo)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-black">
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
            Showing <span className="font-medium">1</span> to <span className="font-medium">{events.length}</span> of <span className="font-medium">{events.length}</span> results
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Event image at the top of the modal */}
            <div className="relative w-full h-48">
              <Image 
                src={deleteConfirmation.eventPhoto} 
                alt={deleteConfirmation.eventTitle}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-center text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium">{deleteConfirmation.eventTitle}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeDeleteConfirmation}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteEvent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}