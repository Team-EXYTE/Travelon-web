import React from "react";
import { Search, Heart, Shield, MessageCircle } from "lucide-react";
import Image from "next/image";

const TravelersFeatures = () => {
  const features = [
    {
      icon: Search,
      title: "Discover Unique Experiences",
      description:
        "Find authentic local events and hidden gems that match your interests and travel style.",
    },
    {
      icon: Heart,
      title: "Personalized Recommendations",
      description:
        "Get tailored suggestions based on your preferences, past experiences, and travel history.",
    },
    {
      icon: Shield,
      title: "Verified & Secure",
      description:
        "All events and organizers are verified for your safety and peace of mind.",
    },
    {
      icon: MessageCircle,
      title: "Connect with Locals",
      description:
        "Chat directly with organizers and fellow travelers to enhance your experience.",
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
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 md:mb-6">
            For Travelers
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Embark on extraordinary journeys with curated experiences that
            transform ordinary trips into unforgettable adventures.
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group hover:bg-gray-50 p-5 md:p-8 rounded-xl md:rounded-2xl transition-all duration-300"
            >
              <div className="flex items-start gap-4 md:gap-6">
                <div className="bg-black rounded-lg md:rounded-xl p-3 md:p-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={22} className="text-white md:hidden" />
                  <feature.icon
                    size={28}
                    className="text-white hidden md:block"
                  />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2 md:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom center black logo */}
      <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 z-30 w-16 h-[46px] sm:w-20 sm:h-[58px] md:w-24 md:h-[70px] flex items-end justify-center">
        <Image
          src="/Travelon Logo Black.png"
          alt="Travelon Logo Black"
          width={40}
          height={58} // Preserves aspect ratio
          className="object-contain"
          priority
        />
      </div>
    </section>
  );
};

export default TravelersFeatures;
