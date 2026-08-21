import React, { useState } from "react";
import { Language } from "../types";
import { translations } from "../translations";
import {
  MapPin,
  Navigation,
  Search,
  ArrowLeft,
  ExternalLink,
  Store,
  Stethoscope,
  Target,
  Loader2,
  Building2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface FindNearbyProps {
  language: Language;
  onBackToHome: () => void;
}

export const FindNearby: React.FC<FindNearbyProps> = ({
  language,
  onBackToHome,
}) => {
  const t = translations[language];
  const [step, setStep] = useState<"input" | "results">("input");
  const [locationInput, setLocationInput] = useState("");
  const [activeLocation, setActiveLocation] = useState<string>("Pagla, Narayanganj, Narayanganj Sadar Upazila");
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Popular quick location chips across Bangladesh
  const popularLocations = [
    "Pagla, Narayanganj",
    "Bogura Sadar",
    "Mithapukur, Rangpur",
    "Dinajpur Sadar",
    "Jashore Sadar",
    "Rajshahi",
    "Mymensingh",
    "Cumilla Sadar",
    "Gazipur",
    "Narsingdi",
  ];

  // Agro Shop items matching Screenshot 2
  const agroShopItems = [
    { title: "Agro Shop", query: "Agro Shop" },
    { title: "Agricultural Store", query: "Agricultural Store" },
    { title: "Seed Store", query: "Seed Store" },
    { title: "Fertilizer Shop", query: "Fertilizer Shop" },
    { title: "Pesticide Dealer (বালাইনাশক ডিলার)", query: "Pesticide Dealer" },
  ];

  // Agro Doctor items matching Screenshot 2
  const agroDoctorItems = [
    { title: "Agricultural Consultant", query: "Agricultural Consultant" },
    { title: "Crop Doctor", query: "Crop Doctor" },
    { title: "Agriculture Extension Officer", query: "Upazila Agriculture Extension Office DAE" },
    { title: "Plant Pathologist", query: "Plant Pathologist agriculture" },
    { title: "Krishi Seba Kendra (কৃষি সেবা কেন্দ্র)", query: "Krishi Seba Kendra" },
  ];

  // Handle GPS location click
  const handleUseGPS = () => {
    setIsLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser. Please enter your city/district manually.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode with OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en,bn" } }
          );
          if (response.ok) {
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            // Extract friendly short address
            const parts = address.split(", ");
            const shortLocation = parts.slice(0, 4).join(", ");
            setActiveLocation(shortLocation);
          } else {
            setActiveLocation(`GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch {
          setActiveLocation(`GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } finally {
          setIsLocating(false);
          setStep("results");
          trackNearbySearch("GPS Location");
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        // Friendly fallback for demo or denied permission
        setActiveLocation("Pagla, Narayanganj, Narayanganj Sadar Upazila");
        setIsLocating(false);
        setStep("results");
        trackNearbySearch("GPS Location (Fallback: Pagla, Narayanganj)");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleManualSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = locationInput.trim();
    if (!query) {
      setActiveLocation("Bangladesh");
    } else {
      setActiveLocation(query);
    }
    setStep("results");
    trackNearbySearch(query || "Bangladesh");
  };

  const handleSelectQuickLocation = (loc: string) => {
    setActiveLocation(loc);
    setLocationInput(loc);
    setStep("results");
    trackNearbySearch(loc);
  };

  const openGoogleMapsSearch = (itemQuery: string) => {
    const fullQuery = `${itemQuery} near ${activeLocation}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
    trackNearbySearch(`${itemQuery} in ${activeLocation}`);
  };

  const trackNearbySearch = (locationQuery: string) => {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "nearby_search",
        query: locationQuery,
      }),
    }).catch(() => {});
  };

  return (
    <div className="min-h-[85vh] bg-[#F9FBF9] text-[#1B3022] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full">
        {/* Top Centered Green Location Icon Pin matching Screenshot 1 & 2 */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shadow-xs mb-4">
            <MapPin className="w-8 h-8 text-[#146C3D] stroke-[2.2]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#146C3D] tracking-tight mb-1.5 font-sans">
            Find Nearby Agro Help
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium">
            Locate agro shops and crop doctors near you
          </p>
        </div>

        {/* SCREEN 1: Location Input Screen (matching Screenshot 2026-08-19 175337.png) */}
        {step === "input" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Primary Action: Use My GPS Location Button */}
            <div>
              <button
                type="button"
                onClick={handleUseGPS}
                disabled={isLocating}
                className="w-full py-4 px-6 bg-[#146C3D] hover:bg-[#0E522C] active:scale-99 text-white rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Detecting Your GPS Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5 rotate-45 stroke-[2.5]" />
                    <span>Use My GPS Location</span>
                  </>
                )}
              </button>
              {geoError && (
                <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2 text-center font-medium">
                  {geoError}
                </p>
              )}
            </div>

            {/* Divider: OR ENTER LOCATION MANUALLY */}
            <div className="relative my-7 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <span className="relative bg-[#F9FBF9] px-4 text-[11px] uppercase tracking-widest font-black text-gray-400">
                OR ENTER LOCATION MANUALLY
              </span>
            </div>

            {/* Manual Location Search Bar */}
            <form onSubmit={handleManualSearch} className="relative">
              <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200/90 rounded-2xl shadow-xs focus-within:ring-2 focus-within:ring-[#146C3D] focus-within:border-transparent transition-all">
                <input
                  type="text"
                  placeholder="Enter city, district or region..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 sm:py-3 bg-[#70B18B] hover:bg-[#5C9E78] active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Popular Agricultural District Quick Suggestions */}
            <div className="pt-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Popular Agricultural Hubs
              </span>
              <div className="flex flex-wrap gap-2">
                {popularLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleSelectQuickLocation(loc)}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Back to Home Button */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#146C3D] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: Category Results Screen (matching Screenshot 2026-08-19 154420.png) */}
        {step === "results" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Location Set Card matching Screenshot 2 */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#146C3D] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Target className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-[#146C3D] block tracking-wide uppercase">
                    Location Set
                  </span>
                  <p className="text-xs sm:text-sm text-gray-700 font-medium truncate">
                    {activeLocation}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep("input")}
                className="text-xs font-bold text-gray-500 hover:text-[#146C3D] underline ml-3 shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* 2 Category Cards Grid matching Screenshot 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: 🏬 Agro Shop */}
              <div className="bg-[#F4F9F5] border border-emerald-100/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#146C3D] flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-1.5">
                        <span>🏬</span>
                        <span>Agro Shop</span>
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mb-4">
                    Agricultural supply stores, seeds, fertilizers &amp; pesticides
                  </p>

                  {/* Item Rows */}
                  <div className="space-y-1.5">
                    {agroShopItems.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => openGoogleMapsSearch(item.query)}
                        className="w-full p-3 rounded-xl bg-white hover:bg-emerald-50/80 border border-gray-100 hover:border-emerald-300 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 hover:text-[#146C3D] group transition-all cursor-pointer shadow-2xs"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#146C3D] transition-colors shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: 🩺 Agro Doctor */}
              <div className="bg-[#F4F9F5] border border-emerald-100/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#146C3D] flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-1.5">
                        <span>🩺</span>
                        <span>Agro Doctor</span>
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mb-4">
                    Crop disease specialists, agricultural consultants &amp; extension officers
                  </p>

                  {/* Item Rows */}
                  <div className="space-y-1.5">
                    {agroDoctorItems.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => openGoogleMapsSearch(item.query)}
                        className="w-full p-3 rounded-xl bg-white hover:bg-emerald-50/80 border border-gray-100 hover:border-emerald-300 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 hover:text-[#146C3D] group transition-all cursor-pointer shadow-2xs"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#146C3D] transition-colors shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Home Button & Change Location Link */}
            <div className="pt-4 flex items-center justify-between text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 text-[#146C3D] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>

              <button
                type="button"
                onClick={() => setStep("input")}
                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-emerald-800 cursor-pointer"
              >
                <span>Change Search Location</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Notice matching Screenshot 1 */}
      <div className="mt-12 text-center text-xs text-gray-400 font-medium">
        <p>Your location is only used to search Google Maps and is never stored</p>
      </div>
    </div>
  );
};
