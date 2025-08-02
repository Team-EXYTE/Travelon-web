"use client";

import React from "react";
import { Users, Calendar, UserCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import Image from "next/image";

interface AdminDashboardData {
  stats: {
    totalOrganizers: number;
    totalActiveEvents: number;
    monthlyEventsCount: number;
    totalTravelers: number;
    monthlyUsersCount: number;
  };
  recentEvents: Array<{
    id: string;
    title: string;
    location: string;
    category: string;
    createdAt: string;
    isEnded: boolean;
    images?: string[];
  }>;
  recentTravelers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    updatedAt: string;
    phoneNumberVerified: boolean;
  }>;
}

export default function AdminDashboard() {
  const { data, loading, error } = useAdminDashboard() as { 
    data: AdminDashboardData | null; 
    loading: boolean; 
    error: string | null 
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
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

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const statCards = [
    { 
      title: "Total Organizers", 
      value: data.stats.totalOrganizers.toString(), 
      icon: Users, 
      change: "+12%" 
    },
    { 
      title: "Active Events", 
      value: data.stats.totalActiveEvents.toString(), 
      icon: Calendar, 
      change: `+${data.stats.monthlyEventsCount} this month` 
    },
    { 
      title: "Total Travellers", 
      value: data.stats.totalTravelers.toString(), 
      icon: UserCircle, 
      change: `+${data.stats.monthlyUsersCount} this month` 
    },
    { 
      title: "Monthly Growth", 
      value: `${data.stats.monthlyEventsCount + data.stats.monthlyUsersCount}`, 
      icon: TrendingUp, 
      change: "+18%" 
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-black rounded-lg p-3 text-white">
                <card.icon size={20} />
              </div>
              <span className="text-green-500 text-sm font-medium">{card.change}</span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-black">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-black mb-4">Recent Events</h2>
          <div className="space-y-4">
            {data.recentEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                  {event.images && event.images.length > 0 ? (
                    <Image 
                      src={event.images[0]} 
                      alt={event.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar size={16} className="text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-black">{event.title}</h4>
                  <p className="text-sm text-gray-600">{event.location} • {event.category}</p>
                  <p className="text-xs text-gray-500">
                    Created {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.isEnded 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {event.isEnded ? 'Ended' : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/events" className="mt-4 text-sm text-black font-medium hover:underline">
            View all events
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-black mb-4">New Travellers</h2>
          <div className="space-y-4">
            {data.recentTravelers.map((traveler) => (
              <div key={traveler.id} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCircle size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-black">
                    {traveler.firstName} {traveler.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">@{traveler.username}</p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(traveler.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    traveler.phoneNumberVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {traveler.phoneNumberVerified ? 'Verified' : 'New'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/customers" className="mt-4 text-sm text-black font-medium hover:underline">
            View all Travellers
          </Link>
        </div>
      </div>
    </div>
  );
}