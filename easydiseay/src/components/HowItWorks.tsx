import React from "react";
import { Language } from "../types";
import { translations } from "../translations";
import { Camera, Zap, Pill, MapPin } from "lucide-react";

interface HowItWorksProps {
  language: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ language }) => {
  const t = translations[language];

  const steps = [
    {
      number: "01",
      icon: Camera,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      bgTint: "bg-[#E8F5E9]",
      borderTint: "border-2 border-[#C8E6C9]",
      iconBg: "bg-emerald-200/70 text-[#1B5E20]",
      badgeColor: "text-[#81C784] opacity-80",
    },
    {
      number: "02",
      icon: Zap,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      bgTint: "bg-[#FFF9C4]",
      borderTint: "border-2 border-[#FFF176]",
      iconBg: "bg-yellow-200/80 text-[#B7950B]",
      badgeColor: "text-[#FBC02D] opacity-80",
    },
    {
      number: "03",
      icon: Pill,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      bgTint: "bg-[#FFECB3]",
      borderTint: "border-2 border-[#FFD54F]",
      iconBg: "bg-amber-200/80 text-[#B7791F]",
      badgeColor: "text-[#FFA000] opacity-80",
    },
    {
      number: "04",
      icon: MapPin,
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc,
      bgTint: "bg-[#DCEDC8]",
      borderTint: "border-2 border-[#C5E1A5]",
      iconBg: "bg-lime-200/80 text-[#33691E]",
      badgeColor: "text-[#689F38] opacity-80",
    },
  ];

  return (
    <section
      id="how-it-works-section"
      className="py-16 sm:py-20 bg-[#F9FBF9] text-[#1B3022] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching Vibrant Palette */}
        <div className="text-center mb-10 sm:mb-14">
          <h2
            id="how-it-works-title"
            className="text-2xl sm:text-3xl font-black text-[#1B5E20] uppercase tracking-wider"
          >
            {t.howItWorks.title}
          </h2>
          <p
            id="how-it-works-subtitle"
            className="text-sm sm:text-base font-bold text-gray-400 mt-1"
          >
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* 4 Cards in 4-column desktop / 2-column tablet / 1-column mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                id={`how-it-works-card-${idx + 1}`}
                className={`relative rounded-3xl p-6 ${step.bgTint} ${step.borderTint} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
              >
                {/* Header row with icon and step number */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-2xl ${step.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-3xl sm:text-4xl font-black tracking-tight ${step.badgeColor}`}>
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-black text-[#1B3022] mb-1 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
