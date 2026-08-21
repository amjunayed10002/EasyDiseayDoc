import React from "react";
import { Language } from "../types";
import { translations } from "../translations";
import { Logo } from "./Logo";
import { Search, MapPin } from "lucide-react";

interface CallToActionProps {
  language: Language;
  onFindDiseaseClick: () => void;
  onFindNearbyClick?: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({
  language,
  onFindDiseaseClick,
  onFindNearbyClick,
}) => {
  const t = translations[language];

  return (
    <section
      id="cta-section"
      className="relative overflow-hidden bg-gradient-to-br from-[#1B5E20] via-[#236B28] to-[#2E7D32] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-center"
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-amber-300 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-emerald-300 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto flex flex-col items-center">
        {/* Logo Badge above heading */}
        <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-md mb-6 p-2 backdrop-blur-xs">
          <Logo size="md" showText={false} />
        </div>

        {/* Large Heading */}
        <h2
          id="cta-main-title"
          className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4"
        >
          {t.cta.title}
        </h2>

        {/* Description */}
        <p className="text-base sm:text-xl text-emerald-100/90 max-w-xl mx-auto mb-8 leading-relaxed">
          {t.cta.description}
        </p>

        {/* Action Buttons: Find Disease + Find Nearby */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-xl mb-6">
          <button
            id="cta-find-disease-btn"
            onClick={onFindDiseaseClick}
            className="w-full sm:w-auto flex-1 group bg-[#FFD54F] text-[#1B5E20] px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg shadow-[0_6px_0_0_#B7950B] hover:translate-y-0.5 hover:shadow-[0_3px_0_0_#B7950B] active:translate-y-1.5 active:shadow-none flex items-center justify-center gap-3 transition-all cursor-pointer border-none"
          >
            <Search className="w-5 h-5 text-[#1B5E20] stroke-[2.5] group-hover:rotate-12 transition-transform" />
            <span>{t.cta.button}</span>
          </button>

          {onFindNearbyClick && (
            <button
              id="cta-find-nearby-btn"
              onClick={onFindNearbyClick}
              className="w-full sm:w-auto px-6 py-4 sm:py-5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/35 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 backdrop-blur-md shadow-sm hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              <MapPin className="w-5 h-5 text-[#FFD54F] stroke-[2.2]" />
              <span>{language === "en" ? "Find Nearby" : "নিকটস্থ সেবা"}</span>
            </button>
          )}
        </div>

        {/* Sub-Badges */}
        <p className="text-xs sm:text-sm font-bold text-white/80 tracking-wide">
          {t.cta.badges}
        </p>
      </div>
    </section>
  );
};

