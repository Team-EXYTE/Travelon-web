import React from "react";
import { Megaphone, TrendingUp, DollarSign, Star } from "lucide-react";

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
    <section className="py-8 md:py-12 bg-black text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            For Event Organizers
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Transform your passion into profit with powerful tools designed to
            help you create, promote, and manage extraordinary events.
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group hover:bg-gray-900 p-5 md:p-8 rounded-xl md:rounded-2xl transition-all duration-300"
            >
              <div className="flex items-start gap-4 md:gap-6">
                <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={22} className="text-black md:hidden" />
                  <feature.icon
                    size={28}
                    className="text-black hidden md:block"
                  />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-base md:text-lg">
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

export default OrganizersFeatures;
