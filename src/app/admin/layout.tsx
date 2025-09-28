"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:pt-20">
      {/* Decorative background pattern */}
      <div
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M0,0 C30,10 70,10 100,0 L100,100 C70,90 30,90 0,100 Z' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M0,50 C30,40 70,60 100,50' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M0,0 Q25,25 50,50 Q75,75 100,100' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M100,0 Q75,25 50,50 Q25,75 0,100' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3C/svg%3E")`,
          backgroundSize: "300px 300px",
          backgroundPosition: "center",
          transform: "rotate(5deg) scale(1.5)",
        }}
      ></div>

      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Fixed header */}
      <header
        className={`fixed top-0 right-0 left-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:left-20" : "lg:left-64"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Mobile toggle button */}
              <button
                onClick={toggleSidebar}
                className="block md:hidden p-2 rounded-md hover:bg-gray-100"
                aria-label="Toggle mobile sidebar"
              >
                <Menu size={24} />
              </button>

              {/* Desktop toggle button */}
              <button
                onClick={toggleSidebar}
                className="hidden md:flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-all"
                aria-label="Toggle sidebar"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight size={20} className="text-gray-500" />
                ) : (
                  <ChevronLeft size={20} className="text-gray-500" />
                )}
                <span className="ml-2 text-sm font-medium text-gray-600">
                  {isSidebarCollapsed ? "Expand" : "Collapse"}
                </span>
              </button>
            </div>

            <div className="flex items-center">
              {/* User profile info can go here */}
            </div>
          </div>
        </div>
      </header>

      <main
        className={`min-h-screen pt-2 transition-all duration-300 relative z-10 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="py-6 px-8">{children}</div>
      </main>
    </div>
  );
}
