import React, { useState } from "react";
import { Language } from "../types";
import { translations } from "../translations";
import { Logo } from "./Logo";
import { Globe, Menu, X, ShieldAlert } from "lucide-react";

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeView: "landing" | "detector" | "admin" | "nearby" | "userLogin";
  setActiveView: (view: "landing" | "detector" | "admin" | "nearby" | "userLogin") => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  activeView,
  setActiveView,
  onOpenAdmin,
}) => {
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    if (activeView !== "landing") {
      setActiveView("landing");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navigation-bar"
      className="sticky top-0 z-40 w-full bg-[#1B5E20]/95 backdrop-blur-md border-b border-emerald-800/50 text-white transition-all shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo
          size="md"
          onClick={() => {
            setActiveView("landing");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-bold">
          <button
            id="nav-home-btn"
            onClick={() => {
              setActiveView("landing");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`hover:text-[#FFD54F] transition-colors ${
              activeView === "landing" ? "text-[#FFD54F]" : "text-white/90"
            }`}
          >
            {t.nav.home}
          </button>
          <button
            id="nav-how-it-works-btn"
            onClick={() => scrollToSection("how-it-works-section")}
            className="text-white/90 hover:text-[#FFD54F] transition-colors"
          >
            {t.nav.howItWorks}
          </button>
          <button
            id="nav-supported-crops-btn"
            onClick={() => scrollToSection("supported-crops-section")}
            className="text-white/90 hover:text-[#FFD54F] transition-colors"
          >
            {t.nav.supportedCrops}
          </button>
          <button
            id="nav-detect-btn"
            onClick={() => {
              setActiveView("detector");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`hover:text-[#FFD54F] transition-colors flex items-center gap-1.5 ${
              activeView === "detector" ? "text-[#FFD54F]" : "text-white/90"
            }`}
          >
            <span>{t.nav.findDisease}</span>
          </button>
          <button
            id="nav-find-nearby-btn"
            onClick={() => {
              setActiveView("nearby");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`hover:text-[#FFD54F] transition-colors flex items-center gap-1.5 ${
              activeView === "nearby" ? "text-[#FFD54F]" : "text-white/90"
            }`}
          >
            <span>{t.nav.findNearby}</span>
          </button>
        </nav>

        {/* Right Action: Language Switcher Pill matching theme */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Pill */}
          <div
            id="language-switcher-pill"
            className="flex items-center bg-white/15 p-1 rounded-full border border-white/20 shadow-inner"
          >
            <button
              id="lang-btn-en"
              onClick={() => onLanguageChange("en")}
              className={`px-3 py-1 text-xs font-black rounded-full transition-all duration-150 ${
                language === "en"
                  ? "bg-[#FFD54F] text-[#1B5E20] shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              id="lang-btn-bn"
              onClick={() => onLanguageChange("bn")}
              className={`px-3 py-1 text-xs font-black rounded-full transition-all duration-150 ${
                language === "bn"
                  ? "bg-[#FFD54F] text-[#1B5E20] shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-emerald-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e4828] border-b border-emerald-700/60 px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-3">
          <button
            onClick={() => {
              setActiveView("landing");
              window.scrollTo({ top: 0, behavior: "smooth" });
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-md font-medium text-white hover:bg-emerald-800"
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => scrollToSection("how-it-works-section")}
            className="block w-full text-left px-3 py-2 rounded-md font-medium text-white hover:bg-emerald-800"
          >
            {t.nav.howItWorks}
          </button>
          <button
            onClick={() => scrollToSection("supported-crops-section")}
            className="block w-full text-left px-3 py-2 rounded-md font-medium text-white hover:bg-emerald-800"
          >
            {t.nav.supportedCrops}
          </button>
          <button
            onClick={() => {
              setActiveView("detector");
              window.scrollTo({ top: 0, behavior: "smooth" });
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-md font-semibold text-amber-300 hover:bg-emerald-800"
          >
            {t.nav.findDisease}
          </button>
          <button
            onClick={() => {
              setActiveView("nearby");
              window.scrollTo({ top: 0, behavior: "smooth" });
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-md font-medium text-white hover:bg-emerald-800"
          >
            {t.nav.findNearby}
          </button>
          <button
            onClick={() => {
              onOpenAdmin();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-md font-medium text-emerald-300 hover:bg-emerald-800"
          >
            {t.nav.admin}
          </button>
        </div>
      )}
    </header>
  );
};
