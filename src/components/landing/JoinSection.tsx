import React from "react";
import { ArrowRight, Compass, Calendar } from "lucide-react";
import Image from "next/image";

const JoinSection = () => {
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
      {/* Top center black logo */}
      <div className="absolute left-1/2 top-8 transform -translate-x-1/2 z-30 w-16 h-[46px] sm:w-20 sm:h-[58px] md:w-24 md:h-[70px] flex items-end justify-center">
        <Image
          src="/Travelon Logo Black.png"
          alt="Travelon Logo Black"
          width={40}
          height={58} // Preserves aspect ratio
          className="object-contain"
          priority
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        <div className="text-center mb-8 md:mb-12 mt-24">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 md:mb-6">
            Join Our Community
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Choose your path and become part of a global community that
            celebrates exploration, creativity, and authentic connections.
          </p>
        </div>

        {/* Full-width cards layout - reduced spacing between cards */}
        <div className="space-y-4 md:space-y-6">
          {/* Traveler Card - reduced padding and sizes */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 md:p-6 rounded-xl md:rounded-2xl group hover:from-gray-100 hover:to-gray-200 transition-all duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6">
              {/* Icon and title section - reduced icon size */}
              <div className="flex flex-col items-center text-center lg:w-1/5">
                <div className="bg-black rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Compass size={20} className="text-white md:hidden" />
                  <Compass size={24} className="text-white hidden md:block" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-black">
                  Join as Traveler
                </h3>
              </div>

              {/* Content section */}
              <div className="lg:w-1/2">
                <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                  Discover amazing experiences, connect with like-minded
                  adventurers, and create memories that last a lifetime.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-700 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-black rounded-full shrink-0"></div>
                    <span>Access to exclusive events</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-black rounded-full shrink-0"></div>
                    <span>Recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-black rounded-full shrink-0"></div>
                    <span>Community support</span>
                  </div>
                </div>
              </div>

              {/* Button section - smaller button */}
              <div className="lg:w-1/6 flex items-center justify-center mt-2 md:mt-0 lg:ml-15">
                <button className="w-full max-w-xs bg-black text-white py-2 md:py-3 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base font-medium group">
                  Start Exploring
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Organizer Card - reduced padding and sizes */}
          <div className="bg-gradient-to-r from-black to-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl group hover:from-gray-800 hover:to-gray-700 transition-all duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6">
              {/* Icon and title section - reduced icon size */}
              <div className="flex flex-col items-center text-center lg:w-1/5">
                <div className="bg-white rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Calendar size={20} className="text-black md:hidden" />
                  <Calendar size={24} className="text-black hidden md:block" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Join as Organizer
                </h3>
              </div>

              {/* Content section - reduced text size */}
              <div className="lg:w-3/5">
                <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base leading-relaxed">
                  Share your passion, build your business, and create
                  extraordinary experiences for travelers around the world.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0"></div>
                    <span>Global reach and exposure</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0"></div>
                    <span>Professional event tools</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0"></div>
                    <span>Revenue optimization</span>
                  </div>
                </div>
              </div>

              {/* Button section - smaller button */}
              <div className="lg:w-1/6 flex items-center justify-center mt-2 md:mt-0 lg:mr-14">
                <button className="w-full max-w-xs bg-white text-black py-2 md:py-3 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base font-medium group">
                  Start Organizing
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
