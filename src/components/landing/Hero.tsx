import React, { useState, useEffect } from "react";
import { ArrowRight, MapPin, LogIn, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  // State to control login hint visibility
  const [showLoginHint, setShowLoginHint] = useState(false);

  // Show the login hint after a short delay when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoginHint(true);
    }, 1000);

    // Auto-hide the hint after some time
    const hideTimer = setTimeout(() => {
      setShowLoginHint(false);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <section className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden px-4 md:px-6">
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M0,0 C30,10 70,10 100,0 L100,100 C70,90 30,90 0,100 Z' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M0,50 C30,40 70,60 100,50' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M0,0 Q25,25 50,50 Q75,75 100,100' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M100,0 Q75,25 50,50 Q25,75 0,100' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3C/svg%3E")`,
          backgroundSize: "300px 300px",
          backgroundPosition: "center",
          transform: "rotate(5deg) scale(1.5)",
        }}
      ></div>
      {/* Circular Image 1 - Left Side - Moved closer to center */}
      <div className="absolute left-[10%] top-1/8 -translate-x-1/4 hidden sm:block z-10">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-96 lg:h-96">
          <div
            className="absolute inset-[-8px] rounded-full border-2 border-dashed border-black"
            style={{ animation: "spin 40s linear infinite" }}
          ></div>
          <div className="rounded-full overflow-hidden h-full w-full">
            <Image
              src="/Sigiriya.jpg"
              alt="Scenic landmark"
              className="object-cover w-full h-full"
              width={300}
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Circular Image 2 - Right Side - Moved closer to center */}
      <div className="absolute right-[15%] bottom-[50%] translate-x-1/4 hidden sm:block z-10">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-72 lg:h-72">
          <div
            className="absolute inset-[-8px] rounded-full border-2 border-dashed border-black"
            style={{ animation: "spin-reverse 25s linear infinite" }}
          ></div>
          <div className="rounded-full overflow-hidden h-full w-full">
            <Image
              src="/temple_of_tooth.jpg"
              alt="Cultural landmark"
              className="object-cover w-full h-full"
              width={200}
              height={200}
            />
          </div>
        </div>
      </div>

      {/* Circular Image 3 - Right Side - Moved closer to center */}
      <div className="absolute right-[10%] bottom-[5%] translate-x-1/4 hidden sm:block z-10">
        <div className="relative w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-40 lg:h-40">
          <div
            className="absolute inset-[-8px] rounded-full border-2 border-dashed border-black"
            style={{ animation: "spin-reverse 25s linear infinite" }}
          ></div>
          <div className="rounded-full overflow-hidden h-full w-full">
            <Image
              src="/mirissa.jpg"
              alt="Cultural landmark"
              className="object-cover w-full h-full"
              width={200}
              height={200}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto text-center relative z-20">
        <div className="mb-4 md:mb-6">
          <MapPin size={36} className="mx-auto mb-3 text-black md:hidden" />
          <MapPin
            size={48}
            className="mx-auto mb-4 text-black hidden md:block"
          />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-black mb-4 md:mb-6 leading-tight">
          Connect.
          <br />
          <span className="text-gray-600">Explore.</span>
          <br />
          Experience.
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
          The ultimate platform connecting passionate travelers with creative
          event organizers. Discover unique experiences and create unforgettable
          memories.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <button className="w-full sm:w-auto group bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg font-medium">
            Start Exploring
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          <button className="w-full sm:w-auto border-2 border-black text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-black hover:text-white transition-all duration-300 text-base sm:text-lg font-medium">
            Organize Events
          </button>
        </div>
      </div>

      {/* Responsive decorative elements */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-2 h-2 bg-black rounded-full animate-pulse z-20"></div>
      <div className="absolute bottom-16 sm:bottom-32 left-8 sm:right-32 w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-700 z-20"></div>
      <div className="absolute top-1/2 right-4 sm:right-16 w-1 h-1 bg-black rounded-full animate-pulse delay-1000 z-20"></div>

      {/* Login button - top right on mobile, bottom left on desktop */}
      <div className="fixed top-0 right-0 sm:top-auto sm:bottom-0 sm:left-0 sm:right-auto z-50">
        {/* Login hint popup - below on mobile, above on desktop */}
        {showLoginHint && (
          <div
            className="absolute top-12 sm:top-auto sm:bottom-12 right-4 sm:right-auto sm:left-5 bg-black text-white py-2 px-4 rounded-lg 
                      shadow-lg w-48 text-sm animate-fade-in"
          >
            <button
              className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-0.5"
              onClick={() => setShowLoginHint(false)}
            >
              <X size={12} />
            </button>
            <div className="flex flex-col">
              <span>Login here to access your account</span>
              {/* Triangle pointer - pointing up on mobile, down on desktop */}
              <div
                className="absolute sm:hidden -top-2 right-4 w-0 h-0 
                        border-l-[8px] border-l-transparent border-b-[8px] border-b-black border-r-[8px] border-r-transparent"
              ></div>
              <div
                className="absolute hidden sm:block -bottom-2 left-4 w-0 h-0 
                        border-l-[8px] border-l-transparent border-t-[8px] border-t-black border-r-[8px] border-r-transparent"
              ></div>
            </div>
          </div>
        )}

        <Link
          href="/auth/login/"
          className="group bg-black text-white py-2 px-4 md:py-3 md:px-6
                   sm:rounded-tr-lg sm:rounded-br-none sm:rounded-bl-none sm:rounded-tl-none
                   rounded-bl-lg rounded-tl-none rounded-tr-none rounded-br-none
                   hover:pr-6 sm:hover:pl-6 md:hover:pl-8 transform hover:-translate-y-1 sm:hover:translate-y-1
                   transition-all duration-300 flex items-center gap-2 
                   shadow-lg sm:origin-bottom-left"
        >
          <span className="order-2 sm:order-1 font-medium">Login</span>
          <LogIn
            size={18}
            className="order-1 sm:order-2 text-white transition-transform group-hover:scale-110"
          />
        </Link>
      </div>
    </section>
  );
};

export default Hero;
