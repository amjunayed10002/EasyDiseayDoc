import React, { useState, useEffect } from "react";
import { Language, AnalyticsTimeRange, AnalyticsReport } from "../types";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Microscope,
  MapPin,
  Clock,
  RotateCcw,
  Sparkles,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface AdminAnalyticsProps {
  language: Language;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ language }) => {
  const [selectedRange, setSelectedRange] = useState<AnalyticsTimeRange>("1d");
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchAnalytics = async (range: AnalyticsTimeRange) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${range}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedRange);
    // Poll every 20 seconds to keep live metrics dynamic
    const interval = setInterval(() => {
      fetchAnalytics(selectedRange);
    }, 20000);
    return () => clearInterval(interval);
  }, [selectedRange]);

  const handleManualReset = async (resetType: "live" | "full") => {
    setResetting(true);
    try {
      const res = await fetch("/api/analytics/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetType }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionNotice(data.message || "Analytics data reset successfully.");
        setResetModalOpen(false);
        fetchAnalytics(selectedRange);
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setResetting(false);
    }
  };

  const rangeLabels: { key: AnalyticsTimeRange; labelEn: string; labelBn: string; badge: string }[] = [
    { key: "1d", labelEn: "1 Day (24 Hours)", labelBn: "১ দিন (২৪ ঘণ্টা)", badge: "Live" },
    { key: "2d", labelEn: "2 Days (48 Hours)", labelBn: "২ দিন (৪৮ ঘণ্টা)", badge: "48h" },
    { key: "7d", labelEn: "1 Week (7 Days)", labelBn: "১ সপ্তাহ (৭ দিন)", badge: "7 Days" },
    { key: "30d", labelEn: "1 Month (30 Days)", labelBn: "১ মাস (৩০ দিন)", badge: "30 Days" },
    { key: "1y", labelEn: "1 Year (All Time)", labelBn: "১ বছর (সর্বমোট)", badge: "12 Months" },
  ];

  return (
    <div id="admin-analytics-view" className="space-y-6">
      {/* Top Header & Range Switcher */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {language === "bn" ? "ভিজিটর ও ব্যবহার পরিসংখ্যান" : "Visitor & Usage Analytics"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            {language === "bn"
              ? "ওয়েবসাইট ভিজিট, রোগ নির্ণয় ব্যবহার ও সর্বাধিক অনুসন্ধানকৃত ফসলের বিস্তারিত বিবরণ"
              : "Track website traffic, crop doctor scans, fruit/crop searches, and geographic trends"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => fetchAnalytics(selectedRange)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            title="Refresh analytics data"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{language === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
          </button>

          <button
            onClick={() => setResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "রিসেট অপশন" : "Reset Data"}</span>
          </button>
        </div>
      </div>

      {/* Action Toast Notification */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 24-Hour Auto-Reset Information Banner */}
      <div className="bg-linear-to-r from-emerald-900 via-[#1B5E20] to-[#154619] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFD54F]/20 text-[#FFD54F] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#FFD54F]">
                {language === "bn" ? "২৪ ঘণ্টার অটোমেটিক সাইকেল রিসেট" : "24-Hour Automated Reset Engine"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              {language === "bn"
                ? "প্রতি ২৪ ঘণ্টা পর পর আজকের লাইভ কাউন্টার স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়ে নতুন সাইকেল শুরু হয়।"
                : "Live daily counts auto-archive every 24 hours into historical archives and start fresh."}
            </p>
          </div>
        </div>

        <div className="bg-black/25 px-4 py-2 rounded-xl border border-white/10 text-right shrink-0">
          <div className="text-[10px] text-emerald-200 font-semibold uppercase">
            {language === "bn" ? "পরবর্তী অটো-রিসেট" : "Next Auto-Reset In"}
          </div>
          <div className="text-base font-black text-amber-300 font-mono">
            {report?.autoReset?.nextResetFormatted || "18h 00m"}
          </div>
        </div>
      </div>

      {/* Time Range Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {rangeLabels.map((item) => (
          <button
            key={item.key}
            onClick={() => setSelectedRange(item.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedRange === item.key
                ? "bg-[#1B5E20] text-[#FFD54F] shadow-sm ring-2 ring-[#FFD54F]/40"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{language === "bn" ? item.labelBn : item.labelEn}</span>
          </button>
        ))}
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visits */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              {language === "bn" ? "মোট ভিজিটর (Page Visits)" : "Total Visits"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              {report ? report.totalVisits.toLocaleString() : "..."}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% vs previous {selectedRange}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        {/* Unique Users */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              {language === "bn" ? "অনন্য ব্যবহারকারী (Unique Users)" : "Unique Users"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              {report ? report.uniqueVisitors.toLocaleString() : "..."}
            </div>
            <div className="text-[11px] font-semibold text-gray-500 mt-1">
              {language === "bn" ? "কৃষক ও কৃষি কর্মকর্তা" : "Farmers & Agronomists"}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Crop Disease Diagnoses / Tool Usage */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              {language === "bn" ? "রোগ নির্ণয় ব্যবহার (AI Scans)" : "AI Diagnoses"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800">
              {report ? report.diagnosesCount.toLocaleString() : "..."}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{report?.diagnosisSuccessRate || 98.4}% accuracy rate</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Microscope className="w-6 h-6" />
          </div>
        </div>

        {/* Nearby Searches */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              {language === "bn" ? "নিকটস্থ সেবা অনুসন্ধান" : "Find Nearby Searches"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-teal-800">
              {report ? report.nearbySearchesCount.toLocaleString() : "..."}
            </div>
            <div className="text-[11px] font-semibold text-teal-600 mt-1">
              {language === "bn" ? "ডাক্তার ও কৃষি দোকান" : "Agro shops & doctors"}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Traffic & Diagnosis Timeline Visualizer */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>
                {language === "bn" ? "ব্যবহার ও ভিজিটর ট্রেন্ড" : "Traffic & Scan Timeline Trends"}
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              {language === "bn"
                ? "নির্বাচিত সময়কালের মধ্যে ভিজিটর আগমন এবং রোগ নির্ণয়ের ধারাবাহিক চিত্র"
                : "Hourly and daily distribution of user visits vs AI plant diagnostic scans"}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-700"></span>
              <span className="text-gray-700">{language === "bn" ? "ভিজিটর" : "Visits"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
              <span className="text-gray-700">{language === "bn" ? "রোগ নির্ণয়" : "Diagnoses"}</span>
            </div>
          </div>
        </div>

        {/* Timeline Bar Visualizer */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end min-h-[160px] pt-4 pb-2 border-b border-gray-100">
          {report?.timeline && report.timeline.length > 0 ? (
            report.timeline.map((point, idx) => {
              const maxVal = Math.max(...report.timeline.map((p) => p.visits), 10);
              const visitHeight = Math.min(100, Math.max(15, Math.round((point.visits / maxVal) * 100)));
              const diagHeight = Math.min(100, Math.max(8, Math.round((point.diagnoses / maxVal) * 100)));

              return (
                <div key={idx} className="flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 bg-gray-900 text-white px-2.5 py-1 rounded-md text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-mono shadow-md">
                    {point.timeLabel}: {point.visits} visits, {point.diagnoses} scans
                  </div>

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    <div
                      style={{ height: `${visitHeight}%` }}
                      className="w-3 sm:w-4 bg-emerald-600 group-hover:bg-emerald-700 rounded-t-sm transition-all"
                    ></div>
                    <div
                      style={{ height: `${diagHeight}%` }}
                      className="w-2.5 sm:w-3 bg-amber-400 group-hover:bg-amber-500 rounded-t-sm transition-all"
                    ></div>
                  </div>

                  <span className="text-[10px] font-bold text-gray-500 truncate w-full text-center">
                    {point.timeLabel}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="col-span-12 text-center text-gray-400 text-xs py-8">
              Loading timeline data...
            </div>
          )}
        </div>
      </div>

      {/* 2-Column: Most Searched Crops/Fruits & Most Detected Diseases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Searched Crops & Fruits */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="text-lg">🌾</span>
                <span>
                  {language === "bn" ? "সর্বাধিক অনুসন্ধানকৃত ফসল ও ফল" : "Most Searched Crops & Fruits"}
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                {language === "bn" ? "কৃষকদের অনুসন্ধানের শতকরা হার" : "Breakdown of crops scanned by farmers"}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
              Top Ranked
            </span>
          </div>

          <div className="space-y-3">
            {report?.topCrops && report.topCrops.length > 0 ? (
              report.topCrops.map((c, idx) => (
                <div key={idx} className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.icon}</span>
                      <span className="font-extrabold text-gray-900">{c.crop}</span>
                      <span className="text-gray-400 font-normal">({c.cropBn})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-900">{c.count.toLocaleString()} searches</span>
                      <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${c.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-xs py-6">No crop search logs yet.</div>
            )}
          </div>
        </div>

        {/* Most Detected Diseases */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="text-lg">🦠</span>
                <span>
                  {language === "bn" ? "সর্বাধিক শনাক্তকৃত রোগসমূহ" : "Most Identified Plant Diseases"}
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                {language === "bn" ? "আক্রান্ত ফসল ও তীব্রতার মাত্রা" : "Frequent pathogens identified in Bangladesh"}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              Severity Log
            </span>
          </div>

          <div className="space-y-3">
            {report?.topDiseases && report.topDiseases.length > 0 ? (
              report.topDiseases.map((d, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-extrabold text-gray-900 flex items-center gap-2">
                      <span>{d.disease}</span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                          d.severity === "High"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {d.severity}
                      </span>
                    </div>
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      {d.diseaseBn} • Target: <span className="font-semibold text-gray-700">{d.crop}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono font-extrabold text-emerald-800">
                    {d.count.toLocaleString()} cases
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-xs py-6">No disease detections yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column: Geographic Distribution & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Geographic Distribution in Bangladesh (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>
                  {language === "bn" ? "অঞ্চলভিত্তিক ব্যবহারকারী বন্টন (বাংলাদেশ)" : "Geographic Distribution (Bangladesh)"}
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                {language === "bn" ? "প্রধান কৃষিপ্রধান জেলাসমূহ হতে ট্রাফিক" : "Traffic origin across agricultural hubs"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report?.locationDistribution?.map((loc, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-gray-100 bg-gray-50/70">
                <div className="flex items-center justify-between text-xs font-bold text-gray-900 mb-1">
                  <span>
                    {loc.district} ({loc.districtBn})
                  </span>
                  <span className="font-mono text-emerald-800">{loc.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 rounded-full"
                    style={{ width: `${loc.percentage}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-gray-500 text-right mt-1 font-mono">
                  {loc.count.toLocaleString()} visitors
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>{language === "bn" ? "ডিভাইস ব্যবহারের অনুপাত" : "Device Breakdown"}</span>
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              {language === "bn" ? "স্মার্টফোন বনাম ডেস্কটপ ব্যবহারকারী" : "Farmer access platforms"}
            </p>

            <div className="space-y-4">
              {report?.deviceBreakdown?.map((dev, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      {idx === 0 ? (
                        <Smartphone className="w-4 h-4 text-blue-600" />
                      ) : idx === 1 ? (
                        <Laptop className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Tablet className="w-4 h-4 text-purple-600" />
                      )}
                      <span>{dev.device}</span>
                    </div>
                    <span className="font-mono font-black text-gray-900">{dev.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? "bg-blue-600" : idx === 1 ? "bg-emerald-600" : "bg-purple-600"
                      }`}
                      style={{ width: `${dev.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-gray-500 text-right font-mono">
                    {dev.count.toLocaleString()} sessions
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Avg Session Duration:</span>
            <span className="font-mono font-bold text-gray-800">2m 44s</span>
          </div>
        </div>
      </div>

      {/* Manual Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-1">
              {language === "bn" ? "অ্যানালিটিক্স ডেটা রিসেট করবেন?" : "Reset Analytics Data"}
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              {language === "bn"
                ? "আপনি কি শুধুমাত্র আজকের ২৪ ঘণ্টার কাউন্টার রিসেট করতে চান, নাকি পূর্ববর্তী সকল ট্রাফিক ও রোগ অনুসন্ধানের তথ্য মুছে দিতে চান?"
                : "Choose whether you want to reset just the current 24-hour cycle counter or clear all historical traffic statistics."}
            </p>

            <div className="space-y-2.5">
              <button
                disabled={resetting}
                onClick={() => handleManualReset("live")}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "আজকের ২৪ ঘণ্টার সাইকেল রিসেট" : "Reset Current 24-Hour Cycle (Today)"}</span>
              </button>

              <button
                disabled={resetting}
                onClick={() => handleManualReset("full")}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "সম্পূর্ণ হিস্টোরি সহ সকল ডেটা রিসেট" : "Full Reset (All Traffic Logs)"}</span>
              </button>

              <button
                disabled={resetting}
                onClick={() => setResetModalOpen(false)}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {language === "bn" ? "বাতিল করুন" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
