import React from "react";
import { ArrowRight, MapPin } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden px-4 md:px-6">
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
      <div className="absolute bottom-16 sm:bottom-32 right-8 sm:right-32 w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-700 z-20"></div>
      <div className="absolute top-1/2 right-4 sm:right-16 w-1 h-1 bg-black rounded-full animate-pulse delay-1000 z-20"></div>
    </section>
  );
};

export default Hero;
