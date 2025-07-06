"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation"; // Add useRouter import
import Link from "next/link";
import {
  Menu,
  X,
  User,
  Home,
  Calendar,
  Settings,
  LogOut,
  MapPin,
  BarChart,
  Plus,
  HelpCircle,
} from "lucide-react";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); // Initialize router for redirection

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Call logout API to clear session cookie server-side
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        router.push("/auth/login");
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black/4 lg:pt-20">
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

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Link href="/organizer" className="flex items-center">
              <MapPin className="h-6 w-6 text-white mr-2" />
              <span className="font-bold text-lg text-white">Travelon</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden rounded-md p-1 hover:bg-gray-800 text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 py-4 px-2 overflow-y-auto">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/organizer"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/organizer"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <Home
                    className={`h-5 w-5 mr-3 ${
                      pathname === "/organizer" ? "text-black" : "text-white"
                    }`}
                  />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/profile"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/profile"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <User
                    className={`h-5 w-5 mr-3 ${
                      pathname === "/organizer/profile"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/events"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/events"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <Calendar
                    className={`h-5 w-5 mr-3 ${
                      pathname === "/organizer/events"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/create-event"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/create-event"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <Plus
                    className={`h-5 w-5 mr-3 ${
                      pathname === "/organizer/create-event"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/analytics"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/analytics"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <BarChart
                    className={`h-5 w-5 mr-3 ${
                      pathname === "/organizer/analytics"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/support"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/settings"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <HelpCircle
                    className={`h-5 w-5 mr-3 ${
                      pathname === "/organizer/support"
                        ? "text-white"
                        : "text-white"
                    }`}
                  />
                  Help & Support
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/settings"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/settings"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <Settings
                    className={`h-5 w-5 mr-3 ${
                      pathname === "/organizer/settings"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  Settings
                </Link>
              </li>
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-left text-red-300 rounded-lg hover:bg-white hover:text-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 md:ml-64">
        {/* Fixed header - this is the key change */}
        <header className="fixed top-0 left-0 right-0 md:left-64 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-md hover:bg-gray-100"
                >
                  <Menu size={24} />
                </button>
              </div>
              <div className="flex items-center">
                {/* User profile info can go here */}
              </div>
            </div>
          </div>
        </header>

        {/* Content with proper padding for fixed header */}
        <main className="pt-20 p-4 sm:p-6 lg:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
