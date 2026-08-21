import React, { useState } from "react";
import { Language } from "../types";
import { translations } from "../translations";
import { MapPin, Phone, Building2, Store, Search, ExternalLink } from "lucide-react";

interface AgroCornersProps {
  language: Language;
}

export const AgroCorners: React.FC<AgroCornersProps> = ({ language }) => {
  const t = translations[language];
  const [districtFilter, setDistrictFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const shops = [
    {
      id: "shop-1",
      name: "Krishi Seba Center & Syngenta Dealer",
      nameBn: "কৃষি সেবা কেন্দ্র ও সিনজেনটা ডিলার",
      district: "Bogura",
      districtBn: "বগুড়া",
      location: "Sherpur Road, Mahasthangarh, Bogura",
      locationBn: "শেরপুর রোড, মহাস্থানগড়, বগুড়া",
      contact: "+880 1712-345678",
      type: "Authorized Agro Dealer",
      typeBn: "অনুমোদিত বালাইনাশক ডিলার",
      brands: ["Syngenta", "Bayer", "Auto Crop"],
    },
    {
      id: "shop-2",
      name: "Bayer CropScience Point - Jessore",
      nameBn: "বায়ার ক্রপসায়েন্স পয়েন্ট - যশোর",
      district: "Jashore",
      districtBn: "যশোর",
      location: "Chowrasta Krishi Market, Jashore",
      locationBn: "চৌরাস্তা কৃষি মার্কেট, যশোর",
      contact: "+880 1711-987654",
      type: "Pesticide & Seed Dealer",
      typeBn: "কীটনাশক ও বীজ ডিলার",
      brands: ["Bayer", "ACI Formulations", "BASF"],
    },
    {
      id: "shop-3",
      name: "Upazila Agriculture Extension Office (DAE)",
      nameBn: "উপজেলা কৃষি সম্প্রসারণ অধিদপ্তর (ডিএই)",
      district: "Rangpur",
      districtBn: "রংপুর",
      location: "Mithapukur, Rangpur",
      locationBn: "মিঠাপুকুর, রংপুর",
      contact: "Contact ED for assistance",
      type: "Government Agriculture Office",
      typeBn: "সরকারি কৃষি অফিস",
      brands: ["Free Consultation", "Soil Testing", "Fungicide Guidelines"],
    },
    {
      id: "shop-4",
      name: "Rajshahi Krishi Bitan & Fertilizer Hub",
      nameBn: "রাজশাহী কৃষি বিতান ও সার কর্নার",
      district: "Rajshahi",
      districtBn: "রাজশাহী",
      location: "Shaheb Bazar, Rajshahi",
      locationBn: "সাহেব বাজার, রাজশাহী",
      contact: "+880 1733-112233",
      type: "Fertilizer & Medicine Shop",
      typeBn: "সার ও বালাইনাশক বিপণি",
      brands: ["Auto Crop", "Syngenta", "Padma Oil Agro"],
    },
    {
      id: "shop-5",
      name: "Mymensingh Seed & Crop Care Center",
      nameBn: "ময়মনসিংহ বীজ ও ফসল সুরক্ষা কেন্দ্র",
      district: "Mymensingh",
      districtBn: "ময়মনসিংহ",
      location: "Choto Bazar, Mymensingh Sadar",
      locationBn: "ছোট বাজার, ময়মনসিংহ সদর",
      contact: "+880 1819-445566",
      type: "Authorized Agro Center",
      typeBn: "অনুমোদিত কৃষি কেন্দ্র",
      brands: ["ACI", "Bayer", "Syngenta"],
    },
    {
      id: "shop-6",
      name: "Cumilla Krishi Clinic & Diagnostic Corner",
      nameBn: "কুমিল্লা কৃষি ক্লিনিক ও রোগ নির্ণয় কর্নার",
      district: "Cumilla",
      districtBn: "কুমিল্লা",
      location: "Kandirpar, Cumilla",
      locationBn: "কান্দিরপাড়, কুমিল্লা",
      contact: "+880 1755-778899",
      type: "Agro Clinic & Dealer",
      typeBn: "কৃষি ক্লিনিক ও ডিলার",
      brands: ["Syngenta", "Auto Crop", "BASF"],
    },
  ];

  const filteredShops = shops.filter((s) => {
    const matchesDistrict =
      districtFilter === "all" || s.district.toLowerCase() === districtFilter.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nameBn.includes(searchTerm) ||
      s.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  return (
    <div id="agro-corners-page" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-[#1B5E20] uppercase tracking-wider">
          {language === "en" ? "Agro Medicine Corners & DAE Offices" : "সার ও বালাইনাশক ডিলার এবং কৃষি অফিস"}
        </h1>
        <p className="text-sm sm:text-base font-bold text-gray-400 mt-2">
          {language === "en"
            ? "Locate certified agricultural medicine stores & extension centers across Bangladesh"
            : "বাংলাদেশের জেলা-উপজেলা পর্যায়ের অনুমোদিত বালাইনাশক কেন্দ্র ও পরামর্শ কেন্দ্রসমূহ"}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder={language === "en" ? "Search by name, district, or market..." : "নাম, জেলা বা বাজার দিয়ে খুঁজুন..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-emerald-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-gray-700 whitespace-nowrap">
            {language === "en" ? "Filter District:" : "জেলা ফিল্টার:"}
          </label>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-xl focus:border-emerald-500 outline-hidden"
          >
            <option value="all">{language === "en" ? "All Districts" : "সকল জেলা"}</option>
            <option value="Bogura">Bogura (বগুড়া)</option>
            <option value="Jashore">Jashore (যশোর)</option>
            <option value="Rangpur">Rangpur (রংপুর)</option>
            <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
            <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
            <option value="Cumilla">Cumilla (কুমিল্লা)</option>
          </select>
        </div>
      </div>

      {/* Grid of Shops */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.map((shop) => (
          <div
            key={shop.id}
            className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {language === "en" ? shop.district : shop.districtBn}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {language === "en" ? shop.type : shop.typeBn}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                {language === "en" ? shop.name : shop.nameBn}
              </h3>
              <p className="text-xs text-gray-600 flex items-start gap-1.5 mb-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === "en" ? shop.location : shop.locationBn}</span>
              </p>
              <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5 mb-4">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{shop.contact}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {shop.brands.map((b, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
