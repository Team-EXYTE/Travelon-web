import React from "react";
import { Users, Calendar, UserCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const statCards = [
    { title: "Total Organizers", value: "24", icon: Users, change: "+12%" },
    { title: "Active Events", value: "47", icon: Calendar, change: "+8%" },
    { title: "Total Travellers", value: "184", icon: UserCircle, change: "+24%" },
    { title: "Monthly Revenue", value: "$8,942", icon: TrendingUp, change: "+18%" }
    
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
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Calendar size={16} className="text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-black">Kandy Cultural Tour</h4>
                  <p className="text-sm text-gray-600">Created 2 days ago</p>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
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
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCircle size={16} className="text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-black">John Smith</h4>
                  <p className="text-sm text-gray-600">Joined yesterday</p>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">New</span>
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