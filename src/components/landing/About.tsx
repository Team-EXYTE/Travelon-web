import React from "react";
import { Globe, Users, Calendar } from "lucide-react";
import Image from "next/image";

const About = () => {
  return (
    <section className="pt-6 md:pt-12 bg-gradient-to-br from-black via-gray-900 to-black text-white h-screen pb-6 relative overflow-hidden">
      {/* Orange accent backgrounds */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-orange-600/8 to-orange-400/3 rounded-full blur-3xl"></div>
        
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FF6B35" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-white">
            About Our Platform
          </h2>
          
          {/* Orange accent line */}
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full mb-6 shadow-lg shadow-orange-500/30"></div>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
            We bridge the gap between wanderlust and wonder, creating a seamless
            ecosystem where travelers discover authentic experiences and
            organizers showcase their creativity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 md:mb-20">
          <div className="text-center group">
            <div className="relative mx-auto mb-6 md:mb-8 w-20 h-20 md:w-24 md:h-24">
              {/* Orange glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              {/* White circle with shadow */}
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-orange-500/20">
                <Globe size={28} className="text-black md:hidden" />
                <Globe size={36} className="text-black hidden md:block" />
              </div>
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 group-hover:border-orange-500/60 transition-colors duration-500"></div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white group-hover:text-orange-200 transition-colors duration-300">
              Local Reach
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base group-hover:text-gray-300 transition-colors duration-300">
              Connect with travelers and organizers across Sri Lanka to expand your network and immerse yourself in diverse cultures.
            </p>
          </div>

          <div className="text-center group">
            <div className="relative mx-auto mb-6 md:mb-8 w-20 h-20 md:w-24 md:h-24">
              {/* Orange glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ animationDelay: "1s" }}></div>
              
              {/* White circle with shadow */}
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-orange-500/20">
                <Users size={28} className="text-black md:hidden" />
                <Users size={36} className="text-black hidden md:block" />
              </div>
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 group-hover:border-orange-500/60 transition-colors duration-500"></div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white group-hover:text-orange-200 transition-colors duration-300">
              Trusted Community
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base group-hover:text-gray-300 transition-colors duration-300">
              Join a verified community of passionate travelers and experienced
              event organizers committed to authentic experiences.
            </p>
          </div>

          <div className="text-center group">
            <div className="relative mx-auto mb-6 md:mb-8 w-20 h-20 md:w-24 md:h-24">
              {/* Orange glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ animationDelay: "2s" }}></div>
              
              {/* White circle with shadow */}
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-orange-500/20">
                <Calendar size={28} className="text-black md:hidden" />
                <Calendar size={36} className="text-black hidden md:block" />
              </div>
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 group-hover:border-orange-500/60 transition-colors duration-500"></div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white group-hover:text-orange-200 transition-colors duration-300">
              Seamless Planning
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base group-hover:text-gray-300 transition-colors duration-300">
              Advanced tools and intuitive interfaces make discovering,
              planning, and organizing events effortless and enjoyable.
            </p>
          </div>
        </div>
        
      </div>
      
      {/* Enhanced bottom logo section */}
      <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 z-30 w-16 h-[46px] sm:w-20 sm:h-[58px] md:w-24 md:h-[70px] flex items-end justify-center group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full blur-lg group-hover:from-orange-400/30 group-hover:to-orange-500/30 transition-all duration-500"></div>
        <Image
          src="/Travelon Logo White.png"
          alt="Inverted Travelon Logo"
          width={40}
          height={58}
          className="object-contain relative z-10 group-hover:scale-105 transition-transform duration-300"
          priority
        />
      </div>
    </section>
  );
};

export default About;
