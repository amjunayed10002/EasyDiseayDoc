import React from "react";
import { Language } from "../types";
import { translations } from "../translations";
import { Logo } from "./Logo";
import { Sparkles, CheckCircle2, ShieldCheck, UserX, Smartphone, Search, User, MapPin } from "lucide-react";

interface HeroProps {
  language: Language;
  onFindDiseaseClick: () => void;
  onFindNearbyClick: () => void;
  onOpenAdmin: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  language,
  onFindDiseaseClick,
  onFindNearbyClick,
  onOpenAdmin,
}) => {
  const t = translations[language];

  return (
    <section
      id="hero-section"
      className="relative overflow-hidden bg-gradient-to-br from-[#1B5E20] via-[#236B28] to-[#2E7D32] text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 transition-colors"
    >
      {/* Decorative SVG Shapes & Circles matching the Vibrant Palette */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-emerald-300 blur-3xl" />
        <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-amber-200 blur-3xl" />
        <div className="absolute bottom-4 left-1/4 w-72 h-72 rounded-full bg-emerald-200 blur-2xl" />
        <div className="absolute bottom-4 right-10 opacity-15">
          <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,11 17,8 17,8Z" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Top Centered Brand Logo */}
        <div className="mb-4">
          <Logo size="lg" />
        </div>

        {/* Small Top Badge */}
        <div
          id="hero-top-badge"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs sm:text-sm font-bold mb-4 backdrop-blur-sm shadow-xs"
        >
          <span className="text-[#FFD54F]">🇧🇩</span>
          <span>{t.hero.badge}</span>
        </div>

        {/* Large Main Heading */}
        <h1
          id="hero-main-heading"
          className="text-5xl sm:text-7xl font-black mb-2 tracking-tighter text-white drop-shadow-sm font-sans"
        >
          {t.hero.title}
        </h1>

        {/* Vibrant Yellow Subtitle */}
        <p
          id="hero-yellow-subtitle"
          className="text-lg sm:text-2xl font-bold italic text-[#FFD54F] mb-1 tracking-wide"
        >
          {t.hero.subtitle}
        </p>

        {/* Small Italic Text */}
        <p className="text-sm sm:text-base italic text-emerald-100/90 mb-4 font-light">
          {t.hero.italicNote}
        </p>

        {/* Main Description */}
        <p
          id="hero-description"
          className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed font-normal"
        >
          {language === "en" ? (
            <>
              Upload a photo of your sick crop. Get instant digital diagnosis with exact Bangladeshi medicines —{" "}
              <span className="text-[#FFD54F] font-bold">completely free</span>.
            </>
          ) : (
            <>
              আপনার আক্রান্ত ফসলের পাতার ছবি আপলোড করুন। সম্পূর্ণ{" "}
              <span className="text-[#FFD54F] font-bold">বিনামূল্যে</span> পান তাৎক্ষণিক রোগ নির্ণয় ও সঠিক বাংলাদেশী ওষুধের প্রেসক্রিপশন।
            </>
          )}
        </p>

        {/* 4 Feature Badges with Outline */}
        <div
          id="hero-feature-badges"
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl mb-8"
        >
          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-white/15 border border-white/25 text-xs sm:text-sm font-bold text-white backdrop-blur-xs">
            <CheckCircle2 className="w-4 h-4 text-[#FFD54F] shrink-0" />
            <span className="truncate">{t.hero.badgeFind}</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-white/15 border border-white/25 text-xs sm:text-sm font-bold text-white backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="truncate">{t.hero.badgeFree}</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-white/15 border border-white/25 text-xs sm:text-sm font-bold text-white backdrop-blur-xs">
            <UserX className="w-4 h-4 text-[#FFD54F] shrink-0" />
            <span className="truncate">{t.hero.badgeNoReg}</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-white/15 border border-white/25 text-xs sm:text-sm font-bold text-white backdrop-blur-xs">
            <Smartphone className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="truncate">{t.hero.badgeMobile}</span>
          </div>
        </div>

        {/* Action Buttons: Find Disease + Find Nearby */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-xl">
          {/* Main Tactile Vibrant Yellow 3D CTA Button */}
          <button
            id="hero-find-disease-cta-btn"
            onClick={onFindDiseaseClick}
            className="w-full sm:w-auto flex-1 group bg-[#FFD54F] text-[#1B5E20] px-7 sm:px-8 py-4 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg shadow-[0_6px_0_0_#B7950B] hover:translate-y-0.5 hover:shadow-[0_3px_0_0_#B7950B] active:translate-y-1.5 active:shadow-none flex items-center justify-center gap-2.5 transition-all cursor-pointer border-none"
          >
            <Search className="w-5 h-5 text-[#1B5E20] stroke-[2.5] group-hover:rotate-12 transition-transform" />
            <span>{t.hero.ctaButton}</span>
          </button>

          {/* Side Compact Button: Find Nearby Agro Help */}
          <button
            id="hero-find-nearby-btn"
            onClick={onFindNearbyClick}
            className="w-full sm:w-auto px-5 py-4 sm:py-4.5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/35 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 backdrop-blur-md shadow-sm hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
          >
            <MapPin className="w-5 h-5 text-[#FFD54F] stroke-[2.2]" />
            <span>{language === "en" ? "Find Nearby" : "নিকটস্থ সেবা"}</span>
          </button>
        </div>
      </div>

      {/* Discreet Admin Profile Icon at bottom-right */}
      <button
        id="hero-admin-profile-btn"
        onClick={onOpenAdmin}
        title="Admin Portal Access"
        className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 flex items-center justify-center text-white shadow-md hover:scale-105 transition-all opacity-80 hover:opacity-100 cursor-pointer"
        aria-label="Admin Login"
      >
        <User className="w-5 h-5 text-[#FFD54F]" />
      </button>
    </section>
  );
};
