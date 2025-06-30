import React from "react";
import { Search, Heart, Shield, MessageCircle } from "lucide-react";

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
    <section className="py-8 md:py-12 min-h-screen bg-white">
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
    </section>
  );
};

export default TravelersFeatures;
