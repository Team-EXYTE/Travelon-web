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
      {/* Orange accent backgrounds */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-100/50 to-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-orange-200/40 to-orange-100/20 rounded-full blur-3xl"></div>
        
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-3">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="join-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#FF6B35" strokeWidth="0.5"/>
                <circle cx="40" cy="40" r="1" fill="#FF6B35" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#join-grid)" />
          </svg>
        </div>
      </div>

      {/* Enhanced top logo section */}
      <div className="absolute left-1/2 top-4 transform -translate-x-1/2 z-30 w-12 h-[35px] sm:w-16 sm:h-[46px] md:w-20 md:h-[58px] flex items-end justify-center group">
        {/* Orange glow effect behind logo */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-orange-600/30 rounded-full blur-lg group-hover:from-orange-400/40 group-hover:to-orange-500/40 transition-all duration-500"></div>
        
        <Image
          src="/Travelon Logo Black.png"
          alt="Travelon Logo"
          width={32}
          height={46}
          className="object-contain relative z-10 group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
          priority
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 flex-1 flex flex-col justify-center">
        
        <div className="text-center mb-6 md:mb-8 mt-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-black via-orange-600 to-black">
              Join Our Community
            </h2>
            
            {/* Orange accent line */}
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full mb-6 shadow-lg shadow-orange-500/20"></div>
            
            <p className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              Choose your path and become part of a global community that celebrates exploration, creativity, and authentic connections.
            </p>
          </div>

        {/* Enhanced cards layout */}
        <div className="space-y-4 md:space-y-6 flex-1">
          {/* Enhanced Traveler Card - Black Theme */}
          <div className="group bg-gradient-to-r from-black/90 to-gray-800/90 backdrop-blur-sm hover:from-black hover:to-gray-800 hover:shadow-xl hover:shadow-orange-500/20 p-4 md:p-6 rounded-xl md:rounded-2xl transition-all duration-500 border border-orange-500/20 hover:border-orange-400/40">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6">
              {/* Enhanced icon and title section */}
              <div className="flex flex-col items-center text-center lg:w-1/5">
                <div className="relative w-12 h-12 md:w-16 md:h-16 mb-2 md:mb-3">
                  {/* Orange glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  
                  {/* White circle with shadow */}
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-orange-500/20">
                    <Compass size={20} className="text-black md:hidden" />
                    <Compass size={24} className="text-black hidden md:block" />
                  </div>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 group-hover:border-orange-500/60 transition-colors duration-500"></div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-orange-200 transition-colors duration-300">
                  Join as Traveler
                </h3>
              </div>

              {/* Content section */}
              <div className="lg:w-1/2">
                <p className="text-gray-300 mb-4 md:mb-6 text-base md:text-lg leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  Discover amazing experiences, connect with like-minded
                  adventurers, and create memories that last a lifetime.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></div>
                    <span>Access to events</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></div>
                    <span>Recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></div>
                    <span>Community support</span>
                  </div>
                </div>
              </div>

              {/* Enhanced button section */}
              <div className="lg:w-1/6 flex items-center justify-center mt-2 md:mt-0 lg:ml-15">
                <button className="group relative w-full max-w-xs bg-gradient-to-r from-white to-gray-100 text-black py-2 md:py-3 rounded-full hover:from-orange-500 hover:to-orange-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base font-medium shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative">Start Exploring</span>
                  <ArrowRight
                    size={16}
                    className="relative group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>

          {/* Enhanced Organizer Card */}
          <div className="group bg-gradient-to-r from-black/90 to-gray-800/90 backdrop-blur-sm hover:from-black hover:to-gray-800 hover:shadow-xl hover:shadow-orange-500/20 p-4 md:p-6 rounded-xl md:rounded-2xl transition-all duration-500 border border-orange-500/20 hover:border-orange-400/40">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6">
              {/* Enhanced icon and title section */}
              <div className="flex flex-col items-center text-center lg:w-1/5">
                <div className="relative w-12 h-12 md:w-16 md:h-16 mb-2 md:mb-3">
                  {/* Orange glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ animationDelay: "2s" }}></div>
                  
                  {/* White circle with shadow */}
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-orange-500/20">
                    <Calendar size={20} className="text-black md:hidden" />
                    <Calendar size={24} className="text-black hidden md:block" />
                  </div>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 group-hover:border-orange-500/60 transition-colors duration-500"></div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-orange-200 transition-colors duration-300">
                  Join as Organizer
                </h3>
              </div>

              {/* Content section */}
              <div className="lg:w-3/5">
                <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  Share your passion, build your business, and create
                  extraordinary experiences for travelers around the world.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></div>
                    <span>Global reach and exposure</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></div>
                    <span>Professional event tools</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></div>
                    <span>Revenue optimization</span>
                  </div>
                </div>
              </div>

              {/* Enhanced button section */}
              <div className="lg:w-1/6 flex items-center justify-center mt-2 md:mt-0 lg:mr-14">
                <button className="group relative w-full max-w-xs bg-gradient-to-r from-white to-gray-100 text-black py-2 md:py-3 rounded-full hover:from-orange-500 hover:to-orange-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base font-medium shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative">Start Organizing</span>
                  <ArrowRight
                    size={16}
                    className="relative group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
