"use client";
import { useRef, useState, useEffect } from "react";

interface ScrollSectionProps {
  children: React.ReactNode;
  index: number;
}

export default function ScrollSection({ children, index }: ScrollSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Only show the first section initially
  const [isVisible, setIsVisible] = useState(index === 0);
  const [hasBeenVisible, setHasBeenVisible] = useState(index === 0);
  const [atBottom, setAtBottom] = useState(false);
  const [atTop, setAtTop] = useState(true);

  // Track internal scroll position
  const handleContentScroll = () => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;

    // Check if scrolled to bottom (with 10px tolerance)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    setAtBottom(isAtBottom);

    // Check if scrolled to top
    setAtTop(scrollTop === 0);
  };

  useEffect(() => {
    // Create a spacer div that acts as a scroll trigger
    const spacerDiv = document.createElement("div");
    spacerDiv.style.height = "100vh";
    spacerDiv.style.width = "100%";
    spacerDiv.style.position = "absolute";
    spacerDiv.style.top = `${index * 100}vh`;
    spacerDiv.style.pointerEvents = "none";
    // spacerDiv.style.backgroundColor = "rgba(255,0,0,0.05)"; // Slightly visible for debugging
    spacerDiv.id = `spacer-${index}`;
    document.body.appendChild(spacerDiv);

    console.log(
      `Created spacer for section ${index} at position ${index * 100}vh`
    );

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log(
          `Section ${index} intersection:`,
          entry.isIntersecting,
          `ratio: ${entry.intersectionRatio}`,
          `rect:`,
          entry.boundingClientRect
        );

        // More lenient visibility detection
        if (entry.intersectionRatio > 0) {
          console.log(`Making section ${index} visible`);
          setIsVisible(true);
          setHasBeenVisible(true);
        } else if (entry.boundingClientRect.top > 0) {
          // Hide only when scrolling back up
          console.log(`Hiding section ${index}`);
          setIsVisible(false);
        }
      },
      {
        threshold: [0, 0.1, 0.5], // Multiple thresholds for better detection
        rootMargin: "-10% 0px -50% 0px", // More generous observation area
      }
    );

    io.observe(spacerDiv);

    // Handle wheel events to prevent default when scrolling within component
    const handleWheel = (e: WheelEvent) => {
      if (!isVisible || !contentRef.current) return;

      const { scrollHeight, clientHeight } = contentRef.current;
      const isScrollable = scrollHeight > clientHeight;

      // If content isn't scrollable, let the page handle scroll
      if (!isScrollable) return;

      const scrollingDown = e.deltaY > 0;

      // If scrolling down at bottom, or up at top, let the page handle scroll
      if ((scrollingDown && atBottom) || (!scrollingDown && atTop)) {
        return;
      }

      // Otherwise prevent default and handle internally
      e.preventDefault();
      contentRef.current.scrollTop += e.deltaY;
    };

    if (isVisible && contentRef.current) {
      document.addEventListener("wheel", handleWheel, { passive: false });
    }

    // Fallback: Make section visible after timeout based on index
    if (index > 0) {
      const timeout = setTimeout(() => {
        const scrollPos = window.scrollY;
        const triggerHeight = index * window.innerHeight * 0.8;

        if (scrollPos > triggerHeight && !isVisible) {
          console.log(`Fallback visibility for section ${index}`);
          setIsVisible(true);
          setHasBeenVisible(true);
        }
      }, 1000);

      return () => {
        clearTimeout(timeout);
        io.disconnect();
        document.body.removeChild(spacerDiv);
        document.removeEventListener("wheel", handleWheel);
      };
    }

    return () => {
      io.disconnect();
      document.body.removeChild(spacerDiv);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [index, isVisible, atBottom, atTop]);

  return (
    <div
      ref={sectionRef}
      className="fixed top-0 left-0 w-full h-screen"
      style={{
        opacity: isVisible ? 1 : 0,
        zIndex: hasBeenVisible ? index + 10 : 0,
        transition: "opacity 0.8s ease",
        transform: isVisible ? "translateY(0)" : "translateY(50px)",
        transitionProperty: "opacity, transform",
        transitionDuration: "0.8s, 0.8s",
        transitionTimingFunction: "ease, cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      {/* Scrollable content wrapper */}
      <div
        ref={contentRef}
        className="h-full w-full overflow-y-auto"
        onScroll={handleContentScroll}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
        }}
      >
        {children}
      </div>

      {/* Scroll indicators - updated positioning for mobile */}
      {isVisible && !atTop && (
        <div className="absolute top-4 md:right-4 right-2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white animate-bounce">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 15L12 9L6 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {isVisible && !atBottom && (
        <div className="absolute bottom-16 md:bottom-4 md:right-4 right-2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white animate-bounce">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
