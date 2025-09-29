import React from "react";
import { Megaphone, TrendingUp, DollarSign, Star } from "lucide-react";
import Image from "next/image";

const OrganizersFeatures = () => {
  const features = [
    {
      icon: Megaphone,
      title: "Showcase Your Events",
      description:
        "Create stunning event listings with rich media and detailed descriptions to attract travelers.",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Audience",
      description:
        "Reach a global network of passionate travelers actively seeking unique experiences.",
    },
    {
      icon: DollarSign,
      title: "Maximize Revenue",
      description:
        "Flexible pricing tools and transparent fee structure to optimize your earnings.",
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description:
        "Collect reviews and ratings to establish credibility and attract more participants.",
    },
  ];

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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-100/50 to-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-200/40 to-orange-100/20 rounded-full blur-3xl"></div>
        
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-3">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="organizers-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#FF6B35" strokeWidth="0.5"/>
                <circle cx="40" cy="40" r="1" fill="#FF6B35" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#organizers-grid)" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 flex-1 flex flex-col justify-center">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-black via-orange-600 to-black">
            For Event Organizers
          </h2>
          
          {/* Orange accent line */}
          <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full mb-6 shadow-lg shadow-orange-500/20"></div>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
            Transform your passion into profit with powerful tools designed to
            help you create, promote, and manage extraordinary events.
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-16 md:mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-2xl hover:shadow-orange-500/10 p-6 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-500 border border-orange-100/50 hover:border-orange-200"
            >
              <div className="flex items-start gap-4 md:gap-6">
                <div className="relative">
                  {/* Orange glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  
                  {/* Icon container */}
                  <div className="relative bg-gradient-to-r from-black to-gray-800 rounded-xl md:rounded-2xl p-4 md:p-5 group-hover:scale-110 group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-500 shadow-lg">
                    <feature.icon size={24} className="text-white md:hidden" />
                    <feature.icon
                      size={32}
                      className="text-white hidden md:block"
                    />
                  </div>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-xl md:rounded-2xl border-2 border-orange-300/20 group-hover:border-orange-500/40 transition-colors duration-500"></div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-black group-hover:text-orange-800 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
      {/* Enhanced bottom logo section */}
      <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 z-30 w-16 h-[46px] sm:w-20 sm:h-[58px] md:w-24 md:h-[70px] flex items-end justify-center group">
        {/* Orange glow effect behind logo */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-orange-600/30 rounded-full blur-lg group-hover:from-orange-400/40 group-hover:to-orange-500/40 transition-all duration-500"></div>
        
        <Image
          src="/Travelon Logo Black.png"
          alt="Travelon Logo"
          width={40}
          height={58}
          className="object-contain relative z-10 group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
          priority
        />
      </div>
    </section>
  );
};

export default OrganizersFeatures;
