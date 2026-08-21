import React, { useEffect, useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  lightMode?: boolean;
  className?: string;
  onClick?: () => void;
  customLogo?: string | null;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  lightMode = false,
  className = "",
  onClick,
  customLogo: propLogo,
}) => {
  const [logoSrc, setLogoSrc] = useState<string | null>(propLogo || null);

  useEffect(() => {
    if (propLogo !== undefined) {
      setLogoSrc(propLogo);
      return;
    }

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => setLogoSrc(settings?.customLogo || null))
      .catch(() => {});
  }, [propLogo]);

  // Refresh immediately when the admin updates the logo in the same tab.
  useEffect(() => {
    const handleLogoChange = () => {
      fetch("/api/settings", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((settings) => setLogoSrc(settings?.customLogo || null))
        .catch(() => {});
    };
    window.addEventListener("easydiseay_logo_changed", handleLogoChange);
    return () => window.removeEventListener("easydiseay_logo_changed", handleLogoChange);
  }, []);

  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <div
      id="easydiseay-main-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Visual Logo Icon Badge matching the reference icon or custom uploaded image */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        {logoSrc ? (
          <img
            src={logoSrc}
            alt="EasyDiseay Logo"
            className="w-full h-full object-contain rounded-xl drop-shadow-md"
          />
        ) : (
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md" fill="none">
            {/* Soil Base / Mound */}
            <path
              d="M 18 92 C 30 84 90 84 102 92 C 85 98 35 98 18 92 Z"
              fill="#795548"
            />
            {/* Green Ground Curve */}
            <path
              d="M 12 95 C 40 86 80 86 108 95 C 90 102 30 102 12 95 Z"
              fill="#43A047"
            />
            {/* Orange Accent Curve underneath */}
            <path
              d="M 22 101 C 45 96 75 96 98 101"
              stroke="#FB8C00"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Left Little Green Sprout */}
            <path
              d="M 28 88 C 24 80 20 82 23 76 C 28 78 28 84 28 88 Z"
              fill="#4CAF50"
            />
            <path
              d="M 30 88 C 34 81 38 83 35 77 C 30 79 30 85 30 88 Z"
              fill="#81C784"
            />

            {/* Bold "E" Letter in Emerald Green */}
            <path
              d="M 26 36 L 56 36 C 60 36 63 39 63 43 L 42 43 L 42 54 L 58 54 C 61 54 63 56 63 59 L 42 59 L 42 70 L 63 70 C 64 74 61 78 57 78 L 26 78 Z"
              fill="#2E7D32"
            />

            {/* Magnifying Glass Outer Rim */}
            <circle
              cx="74"
              cy="52"
              r="26"
              stroke="#FB8C00"
              strokeWidth="7"
              fill="#FFFFFF"
            />
            {/* Magnifying Glass Inner Diseased Leaf */}
            <path
              d="M 60 62 C 60 42 76 36 86 42 C 88 56 78 68 60 62 Z"
              fill="#7CB342"
            />
            {/* Leaf Spots (Infection / Disease) */}
            <circle cx="68" cy="50" r="2.5" fill="#BF360C" />
            <circle cx="76" cy="46" r="3" fill="#D84315" />
            <circle cx="80" cy="54" r="2.5" fill="#BF360C" />
            <circle cx="72" cy="58" r="2" fill="#D84315" />

            {/* Top Green Leaves sprouting from Magnifying Glass */}
            <path
              d="M 64 28 C 60 20 54 22 57 16 C 63 18 64 24 64 28 Z"
              fill="#43A047"
            />
            <path
              d="M 72 26 C 78 18 84 21 80 15 C 73 17 73 23 72 26 Z"
              fill="#66BB6A"
            />

            {/* Magnifying Glass Handle */}
            <line
              x1="92"
              y1="70"
              x2="108"
              y2="86"
              stroke="#E65100"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1="93"
              y1="71"
              x2="107"
              y2="85"
              stroke="#FFB74D"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-black tracking-tight flex items-baseline ${textSizes[size]}`}>
            <span className={lightMode ? "text-emerald-800" : "text-white"}>Easy</span>
            <span className="text-[#FFD54F]">Diseay</span>
          </div>
        </div>
      )}
    </div>
  );
};
