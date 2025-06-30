import React from "react";
import { Globe, Users, Calendar } from "lucide-react";

const About = () => {
  return (
    <section className="pt-12 md:pt-24 bg-black text-white min-h-screen pb-6">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            About Our Platform
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            We bridge the gap between wanderlust and wonder, creating a seamless
            ecosystem where travelers discover authentic experiences and
            organizers showcase their creativity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          <div className="text-center group">
            <div className="bg-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Globe size={24} className="text-black md:hidden" />
              <Globe size={32} className="text-black hidden md:block" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
              Global Reach
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              Connect with travelers and organizers from around the world,
              expanding your network and discovering diverse cultures.
            </p>
          </div>

          <div className="text-center group">
            <div className="bg-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users size={24} className="text-black md:hidden" />
              <Users size={32} className="text-black hidden md:block" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
              Trusted Community
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              Join a verified community of passionate travelers and experienced
              event organizers committed to authentic experiences.
            </p>
          </div>

          <div className="text-center group sm:col-span-2 md:col-span-1 sm:max-w-sm sm:mx-auto md:max-w-none">
            <div className="bg-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Calendar size={24} className="text-black md:hidden" />
              <Calendar size={32} className="text-black hidden md:block" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
              Seamless Planning
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              Advanced tools and intuitive interfaces make discovering,
              planning, and organizing events effortless and enjoyable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
