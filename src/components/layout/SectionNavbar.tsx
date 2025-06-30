"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

interface NavItem {
  name: string;
  section: number;
}

export default function SectionNavbar() {
  const [activeSection, setActiveSection] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems: NavItem[] = [
    { name: "Home", section: 0 },
    { name: "About", section: 1 },
    { name: "For Travelers", section: 2 },
    { name: "For Organizers", section: 3 },
    { name: "Join Us", section: 4 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Determine active section based on scroll position
      const sectionIndex = Math.floor(
        (scrollPosition + windowHeight / 2) / windowHeight
      );
      setActiveSection(Math.min(sectionIndex, navItems.length - 1));

      // Auto-collapse on scroll
      if (isExpanded) setIsExpanded(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems.length, isExpanded]);

  const navigateToSection = (section: number) => {
    // Scroll to the appropriate section
    window.scrollTo({
      top: section * window.innerHeight,
      behavior: "smooth",
    });

    // Collapse menu after selection
    setIsExpanded(false);
  };

  return (
    <>
      {/* Desktop navigation (right side) */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] hidden md:block">
        <div className="flex flex-col items-center gap-6">
          {navItems.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Circle indicator */}
              <motion.button
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  activeSection === item.section
                    ? "border-black bg-black scale-125"
                    : "border-gray-400 hover:border-black"
                }`}
                onClick={() => navigateToSection(item.section)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.2 }}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeSection === item.section
                      ? "bg-white"
                      : "bg-transparent"
                  }`}
                ></span>
              </motion.button>

              {/* Tooltip */}
              <div className="absolute right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black text-white text-sm px-3 py-1 rounded-md whitespace-nowrap">
                  {item.name}
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-0 transform rotate-45 w-2 h-2 bg-black"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile navigation (expandable) */}
      <div className="fixed bottom-6 right-6 z-[100] md:hidden">
        <div className="relative">
          {/* Main toggle button */}
          <motion.button
            className={`w-12 h-12 rounded-full bg-black text-white shadow-lg flex items-center justify-center z-20`}
            onClick={() => setIsExpanded(!isExpanded)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronUp size={20} />
            </motion.div>
          </motion.button>

          {/* Expandable navigation items */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="absolute bottom-16 right-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col-reverse items-center gap-4 mb-2">
                  {navItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="relative group"
                    >
                      <button
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                          activeSection === item.section
                            ? "bg-black text-white"
                            : "bg-white text-black border border-gray-200"
                        }`}
                        onClick={() => navigateToSection(item.section)}
                      >
                        <span className="text-xs font-medium">{idx + 1}</span>
                      </button>

                      {/* Small tooltip */}
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <div className="bg-black text-white text-xs px-2 py-1 rounded">
                          {item.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active section indicator on collapsed state */}
          {!isExpanded && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-white">
                {/* {activeSection + 1} */}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
