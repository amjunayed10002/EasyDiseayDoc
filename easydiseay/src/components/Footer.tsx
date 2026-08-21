import React from "react";
import { Language } from "../types";
import { translations } from "../translations";
import { Logo } from "./Logo";
import { User, PhoneCall, Heart } from "lucide-react";

interface FooterProps {
  language: Language;
  onOpenAdmin: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onOpenAdmin, onOpenContact }) => {
  const t = translations[language];

  return (
    <footer
      id="main-footer"
      className="relative bg-[#1B3022] text-white/70 py-10 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/60 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        {/* Brand & Tagline */}
        <div className="flex flex-col items-center sm:items-start gap-2">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-xs text-white/60">• Digital Crop Doctor</span>
          </div>
          <p className="text-sm font-bold text-[#FFD54F] flex items-center gap-1.5 mt-0.5">
            <Heart className="w-4 h-4 text-[#FFD54F] fill-[#FFD54F]" />
            <span>{t.footer.tagline}</span>
          </p>
          <p className="text-xs text-white/50 max-w-sm">
            {t.footer.copyright}
          </p>
        </div>

        {/* ED support contact */}
        <div className="flex flex-col items-center sm:items-end gap-1.5">
          <button type="button" onClick={onOpenContact} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white hover:bg-white/20">
            <PhoneCall className="w-3.5 h-3.5 text-[#FFD54F]" />
            <span>Contact ED</span>
          </button>
        </div>
      </div>

      {/* Discreet Admin Profile Icon at bottom-right corner matching theme */}
      <button
        id="footer-admin-profile-btn"
        onClick={onOpenAdmin}
        title="Admin Portal Access"
        className="fixed bottom-4 right-4 z-30 w-10 h-10 rounded-full bg-[#1B5E20] hover:bg-[#2E7D32] border border-[#FFD54F]/40 flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group"
        aria-label="Admin Access"
      >
        <User className="w-5 h-5 text-[#FFD54F] group-hover:text-white" />
        <span className="sr-only">Admin Login</span>
      </button>
    </footer>
  );
};
