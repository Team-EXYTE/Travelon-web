"use client";

// import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronLeft, 
  Users, 
  Calendar, 
  UserCircle,
  LayoutDashboard,
  Settings,
  LogOut,
  CreditCard
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();
  
  const mainNavItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      isActive: pathname === "/admin"
    },
    {
      title: "Organizers",
      icon: Users,
      href: "/admin/organizers",
      isActive: pathname === "/admin/organizers"
    },
    {
      title: "Events",
      icon: Calendar,
      href: "/admin/events",
      isActive: pathname === "/admin/events"
    },
    {
      title: "Travellers",
      icon: UserCircle,
      href: "/admin/travellers",
      isActive: pathname === "/admin/travellers"
    },{
      title: "Payments",
      icon: CreditCard,
      href: "/admin/payments",
      isActive: pathname === "/admin/payments"
    },
    {
      title: "Create Admins",
      icon: Users,
      href: "/admin/admins",
      isActive: pathname === "/admin/admins"
    },

  ];

  const utilityNavItems = [
    {
      title: "Settings",
      icon: Settings,
      href: "/admin/settings",
      isActive: pathname === "/admin/settings"
    },
    {
      title: "Logout",
      icon: LogOut,
      href: "/auth/login",
      isActive: false
    }
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 h-screen bg-black text-white transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar header with logo and collapse button */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <Link 
          href="/admin" 
          className={`flex items-center gap-2 transition-opacity duration-300 ${
            isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
          }`}
        >
          <span className="text-xl font-bold">Travelon Admin</span>
        </Link>
        
        <button 
          onClick={toggleSidebar}
          className={`p-2 rounded-full hover:bg-gray-800 transition-all duration-300 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      
      {/* Main navigation */}
      <div className="py-6">
        <div className="px-4 mb-2">
          <h2 className={`text-xs font-semibold text-gray-400 uppercase tracking-wider ${
            isCollapsed ? "opacity-0" : "opacity-100"
          } transition-opacity duration-300`}>
            Main
          </h2>
        </div>
        
        <nav>
          <ul>
            {mainNavItems.map((item, index) => (
              <li key={index}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-3 mb-1 transition-colors duration-200 ${
                    item.isActive 
                      ? "bg-gray-800 text-white" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon size={20} className="shrink-0" />
                  <span 
                    className={`ml-4 transition-opacity duration-300 ${
                      isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Utility navigation */}
      <div className="absolute bottom-0 left-0 right-0 py-6 border-t border-gray-800">
        <div className="px-4 mb-2">
          <h2 className={`text-xs font-semibold text-gray-400 uppercase tracking-wider ${
            isCollapsed ? "opacity-0" : "opacity-100"
          } transition-opacity duration-300`}>
            Utility
          </h2>
        </div>
        
        <nav>
          <ul>
            {utilityNavItems.map((item, index) => (
              <li key={index}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-3 mb-1 transition-colors duration-200 ${
                    item.isActive 
                      ? "bg-gray-800 text-white" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon size={20} className="shrink-0" />
                  <span 
                    className={`ml-4 transition-opacity duration-300 ${
                      isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;