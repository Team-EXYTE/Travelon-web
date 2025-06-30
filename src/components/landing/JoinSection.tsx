import React from "react";
import { ArrowRight, Compass, Calendar } from "lucide-react";

const JoinSection = () => {
  return (
    <section className="pt-12 bg-white min-h-screen flex items-center ">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 md:mb-6">
            Join Our Community
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Choose your path and become part of a global community that
            celebrates exploration, creativity, and authentic connections.
          </p>
        </div>

        {/* Full-width cards layout */}
        <div className="space-y-6 md:space-y-8">
          {/* Traveler Card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 md:p-8 rounded-2xl md:rounded-3xl group hover:from-gray-100 hover:to-gray-200 transition-all duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 md:gap-8">
              {/* Icon and title section */}
              <div className="flex flex-col items-center text-center lg:w-1/4">
                <div className="bg-black rounded-full w-16 h-16 md:w-24 md:h-24 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Compass size={28} className="text-white md:hidden" />
                  <Compass size={36} className="text-white hidden md:block" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-black">
                  Join as Traveler
                </h3>
              </div>

              {/* Content section */}
              <div className="lg:w-1/2">
                <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                  Discover amazing experiences, connect with like-minded
                  adventurers, and create memories that last a lifetime.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                  <div className="flex items-center gap-2 md:gap-3 text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 bg-black rounded-full shrink-0"></div>
                    <span>Access to exclusive events</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 bg-black rounded-full shrink-0"></div>
                    <span>Personalized recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 bg-black rounded-full shrink-0"></div>
                    <span>Community support</span>
                  </div>
                </div>
              </div>

              {/* Button section */}
              <div className="lg:w-1/4 flex items-center justify-center mt-2 md:mt-0">
                <button className="w-full max-w-xs bg-black text-white py-3 md:py-4 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg font-medium group">
                  Start Exploring
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Organizer Card */}
          <div className="bg-gradient-to-r from-black to-gray-800 p-5 md:p-8 rounded-2xl md:rounded-3xl group hover:from-gray-800 hover:to-gray-700 transition-all duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 md:gap-8">
              {/* Icon and title section */}
              <div className="flex flex-col items-center text-center lg:w-1/4">
                <div className="bg-white rounded-full w-16 h-16 md:w-24 md:h-24 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar size={28} className="text-black md:hidden" />
                  <Calendar size={36} className="text-black hidden md:block" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  Join as Organizer
                </h3>
              </div>

              {/* Content section */}
              <div className="lg:w-1/2">
                <p className="text-gray-300 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                  Share your passion, build your business, and create
                  extraordinary experiences for travelers around the world.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                  <div className="flex items-center gap-2 md:gap-3 text-gray-300 text-sm md:text-base">
                    <div className="w-2 h-2 bg-white rounded-full shrink-0"></div>
                    <span>Global reach and exposure</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-gray-300 text-sm md:text-base">
                    <div className="w-2 h-2 bg-white rounded-full shrink-0"></div>
                    <span>Professional event tools</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-gray-300 text-sm md:text-base">
                    <div className="w-2 h-2 bg-white rounded-full shrink-0"></div>
                    <span>Revenue optimization</span>
                  </div>
                </div>
              </div>

              {/* Button section */}
              <div className="lg:w-1/4 flex items-center justify-center mt-2 md:mt-0">
                <button className="w-full max-w-xs bg-white text-black py-3 md:py-4 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg font-medium group">
                  Start Organizing
                  <ArrowRight
                    size={18}
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
