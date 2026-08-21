import React, { useState } from "react";
import { Language, AnalysisResult } from "../types";
import {
  Stethoscope,
  Sprout,
  AlertTriangle,
  Table,
  Columns,
  Printer,
  Share2,
  RotateCcw,
  CheckCircle,
  Download,
  Copy,
} from "lucide-react";

interface AnalysisResultViewProps {
  result: AnalysisResult;
  language: Language;
  onReset: () => void;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  result,
  language,
  onReset,
}) => {
  const [viewMode, setViewMode] = useState<"transpose" | "table">("transpose");
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [printedNotification, setPrintedNotification] = useState<boolean>(false);

  const isBn = language === "bn";

  // Determine severity badge
  const severityText = result.confidence.toLowerCase().includes("high")
    ? isBn ? "উচ্চ" : "High"
    : result.confidence.toLowerCase().includes("low")
    ? isBn ? "কম" : "Low"
    : isBn ? "মাঝারি" : "Medium";

  const severityColor = severityText === "High" || severityText === "উচ্চ"
    ? "bg-rose-100 text-rose-800"
    : severityText === "Low" || severityText === "কম"
    ? "bg-emerald-100 text-emerald-800"
    : "bg-amber-100 text-amber-800";

  // Robust Print & Download Prescription handler
  const handlePrint = () => {
    setPrintedNotification(true);
    setTimeout(() => setPrintedNotification(false), 3000);

    // 1. Try browser window.print()
    try {
      window.print();
    } catch {
      // Handled silently for iframes
    }

    // 2. Generate and download a styled HTML prescription slip
    const medItems = (isBn ? result.bangladeshMedicinesBn : result.bangladeshMedicines)
      .map((m) => `<li>${m}</li>`)
      .join("");

    const prescriptionHtml = `<!DOCTYPE html>
<html lang="${isBn ? "bn" : "en"}">
<head>
  <meta charset="UTF-8">
  <title>EasyDiseay Prescription - ${result.crop} (${result.disease})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 32px; color: #1f2937; max-width: 720px; margin: 0 auto; background: #fff; line-height: 1.6; }
    .header { border-bottom: 2px solid #1E7743; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .logo { color: #1E7743; font-size: 24px; font-weight: bold; }
    .meta { font-size: 13px; color: #6b7280; }
    .summary-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .badge { display: inline-block; background: #dc2626; color: #fff; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: bold; margin-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 12px 14px; border: 1px solid #e5e7eb; text-align: left; vertical-align: top; font-size: 14px; }
    th { background: #1E7743; color: white; font-weight: bold; }
    td.field { font-weight: bold; color: #1E7743; background: #f9fafb; width: 30%; }
    .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🌱 EasyDiseay — Digital Crop Doctor</div>
    <div class="meta">Date: ${result.date || new Date().toLocaleDateString()}</div>
  </div>

  <div class="summary-box">
    <h3 style="margin:0 0 6px 0; color:#1E7743;">
      ${isBn ? result.cropBn : result.crop}
      <span class="badge">⚠ ${isBn ? "রোগাক্রান্ত" : "Diseased"}</span>
    </h3>
    <p style="margin:0; font-size:14px; color:#374151;">
      ${isBn ? result.cropBn : result.crop}: <strong>${isBn ? result.diseaseBn : result.disease}</strong>
    </p>
  </div>

  <table>
    <thead>
      <tr>
        <th>${isBn ? "ক্ষেত্র" : "Field"}</th>
        <th>${isBn ? "রোগের বিবরণ ও সমাধান" : "Details & Solution"}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="field">${isBn ? "রোগের নাম" : "Disease Name"}</td>
        <td><strong>${isBn ? result.diseaseBn : result.disease}</strong></td>
      </tr>
      <tr>
        <td class="field">${isBn ? "তীব্রতা" : "Severity"}</td>
        <td>${severityText}</td>
      </tr>
      <tr>
        <td class="field">${isBn ? "কীভাবে ছড়ায়" : "How It Happens"}</td>
        <td>${isBn ? result.symptomsBn : result.symptoms}</td>
      </tr>
      <tr>
        <td class="field">${isBn ? "কেন ঘটে" : "Why It Happens"}</td>
        <td>${isBn ? result.causesBn : result.causes}</td>
      </tr>
      <tr>
        <td class="field">${isBn ? "প্রতিকার ও সমাধান" : "Recovery Solution"}</td>
        <td>${isBn ? result.treatmentBn : result.treatment}</td>
      </tr>
      <tr>
        <td class="field">${isBn ? "অনুমোদিত ওষুধ" : "Medicines"}</td>
        <td><ul>${medItems}</ul></td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
  </div>
</body>
</html>`;

    const blob = new Blob([prescriptionHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EasyDiseay_Prescription_${result.crop}_${result.disease.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Robust Share Handler
  const handleShare = () => {
    const medList = isBn
      ? result.bangladeshMedicinesBn.join(", ")
      : result.bangladeshMedicines.join(", ");
    
    const textToShare = `EasyDiseay Prescription:\n• Crop: ${isBn ? result.cropBn : result.crop}\n• Disease: ${isBn ? result.diseaseBn : result.disease}\n• Severity: ${severityText}\n• Treatment: ${isBn ? result.treatmentBn : result.treatment}\n• Recommended Medicines: ${medList}`;

    if (navigator.share) {
      navigator
        .share({
          title: `EasyDiseay Prescription - ${result.crop} (${result.disease})`,
          text: textToShare,
          url: window.location.href,
        })
        .catch(() => {
          copyToClipboard(textToShare);
        });
    } else {
      copyToClipboard(textToShare);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 3000);
      });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    }
  };

  return (
    <div
      id="analysis-result-card"
      className="mt-12 pt-8 border-t border-emerald-100 animate-in fade-in slide-in-from-bottom-6 duration-300 w-full"
    >
      {/* 1. Header with Microscope Icon matching Screenshot */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold text-[#1E7743]">
          <Stethoscope className="w-6 h-6 text-[#1E7743]" />
          <h2>{isBn ? "বিশ্লেষণ রিপোর্ট" : "Analysis Report"}</h2>
        </div>

        {/* Notifications */}
        {printedNotification && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? "প্রেসক্রিপশন ডাউনলোড হয়েছে!" : "Prescription saved & downloaded!"}</span>
          </div>
        )}
        {copiedNotification && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? "প্রেসক্রিপশন ক্লিপবোর্ডে কপি হয়েছে!" : "Prescription copied to clipboard!"}</span>
          </div>
        )}
      </div>

      {/* 2. Top Crop Summary Card matching Screenshot */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6 mb-8 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Sprout className="w-5 h-5 text-[#1E7743]" />
            <span>{isBn ? result.cropBn : result.crop}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isBn ? "রোগাক্রান্ত (Diseased)" : "Diseased"}</span>
          </span>
        </div>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {isBn ? (
            <>
              {result.cropBn} গাছে <span className="font-semibold text-gray-800">{result.diseaseBn}</span> রোগের লক্ষণ পরিলক্ষিত হয়েছে। নিচে লক্ষণ, কারণ ও অনুমোদিত ওষুধের তালিকা প্রদান করা হলো।
            </>
          ) : (
            <>
              The {result.crop.toLowerCase()} shows signs of{" "}
              <span className="font-semibold text-gray-800">{result.disease}</span> with visible lesions and symptoms on the foliage.
            </>
          )}
        </p>
      </div>

      {/* 3. Section Title & View Toggle Buttons */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {isBn ? "রোগের বিশ্লেষণ (DISEASE ANALYSIS)" : "DISEASE ANALYSIS"}
        </span>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-[#1E7743] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{isBn ? "টেবিল" : "Table"}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("transpose")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "transpose"
                ? "bg-[#1E7743] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isBn ? "ট্রান্সপোজ" : "Transpose"}</span>
          </button>
        </div>
      </div>

      {/* 4. Disease Analysis Table matching Screenshot */}
      <div className="rounded-2xl overflow-hidden border border-[#A7D8B9]/80 bg-white shadow-xs mb-8">
        {viewMode === "transpose" ? (
          /* Transpose Mode Table (Exact layout from Screenshot 2026-08-19 154338.png) */
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#1E7743] text-white font-bold text-sm">
                <th className="px-5 sm:px-6 py-3.5 w-1/4 sm:w-1/5 border-r border-emerald-600 font-bold">
                  {isBn ? "ক্ষেত্র (Field)" : "Field"}
                </th>
                <th className="px-5 sm:px-6 py-3.5 font-bold">
                  {isBn ? "রোগ ১ (Disease 1)" : "Disease 1"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Row 1: Disease Name */}
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 sm:px-6 py-4 font-bold text-[#1E7743] bg-[#FBFDFB] border-r border-gray-100">
                  {isBn ? "রোগের নাম" : "Disease Name"}
                </td>
                <td className="px-5 sm:px-6 py-4 font-bold text-gray-900 text-base">
                  {isBn ? result.diseaseBn : result.disease}
                </td>
              </tr>

              {/* Row 2: Severity */}
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 sm:px-6 py-4 font-bold text-[#1E7743] bg-[#FBFDFB] border-r border-gray-100">
                  {isBn ? "তীব্রতা" : "Severity"}
                </td>
                <td className="px-5 sm:px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${severityColor}`}>
                    {severityText}
                  </span>
                </td>
              </tr>

              {/* Row 3: How It Happens */}
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 sm:px-6 py-4 font-bold text-[#1E7743] bg-[#FBFDFB] border-r border-gray-100 align-top">
                  {isBn ? "কীভাবে ছড়ায়" : "How It Happens"}
                </td>
                <td className="px-5 sm:px-6 py-4 text-gray-700 leading-relaxed">
                  {isBn ? result.symptomsBn : result.symptoms}
                </td>
              </tr>

              {/* Row 4: Why It Happens */}
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 sm:px-6 py-4 font-bold text-[#1E7743] bg-[#FBFDFB] border-r border-gray-100 align-top">
                  {isBn ? "কেন ঘটে" : "Why It Happens"}
                </td>
                <td className="px-5 sm:px-6 py-4 text-gray-700 leading-relaxed">
                  {isBn ? result.causesBn : result.causes}
                </td>
              </tr>

              {/* Row 5: Recovery Solution */}
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 sm:px-6 py-4 font-bold text-[#1E7743] bg-[#FBFDFB] border-r border-gray-100 align-top">
                  {isBn ? "প্রতিকার ও সমাধান" : "Recovery Solution"}
                </td>
                <td className="px-5 sm:px-6 py-4 text-gray-700 leading-relaxed">
                  {isBn ? result.treatmentBn : result.treatment}
                </td>
              </tr>

              {/* Row 6: Medicines */}
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 sm:px-6 py-4 font-bold text-[#1E7743] bg-[#FBFDFB] border-r border-gray-100 align-top">
                  {isBn ? "অনুমোদিত ওষুধ" : "Medicines"}
                </td>
                <td className="px-5 sm:px-6 py-4 text-gray-800">
                  <div className="space-y-1.5 font-medium">
                    {(isBn ? result.bangladeshMedicinesBn : result.bangladeshMedicines).map((med, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-[#1E7743] font-bold">•</span>
                        <span>{med}</span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          /* Standard Multi-Column Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[600px]">
              <thead>
                <tr className="bg-[#1E7743] text-white font-bold text-xs sm:text-sm">
                  <th className="px-4 py-3 border-r border-emerald-600">{isBn ? "রোগের নাম" : "Disease"}</th>
                  <th className="px-4 py-3 border-r border-emerald-600">{isBn ? "তীব্রতা" : "Severity"}</th>
                  <th className="px-4 py-3 border-r border-emerald-600">{isBn ? "লক্ষণ ও কারণ" : "Symptoms & Causes"}</th>
                  <th className="px-4 py-3">{isBn ? "প্রতিকার ও ওষুধ" : "Recovery & Medicines"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-4 font-bold text-gray-900 border-r border-gray-100 align-top">
                    {isBn ? result.diseaseBn : result.disease}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100 align-top">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${severityColor}`}>
                      {severityText}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100 align-top text-gray-700 text-xs sm:text-sm space-y-2">
                    <p><strong>{isBn ? "লক্ষণ:" : "Symptoms:"}</strong> {isBn ? result.symptomsBn : result.symptoms}</p>
                    <p><strong>{isBn ? "কারণ:" : "Causes:"}</strong> {isBn ? result.causesBn : result.causes}</p>
                  </td>
                  <td className="px-4 py-4 align-top text-gray-700 text-xs sm:text-sm space-y-2">
                    <p>{isBn ? result.treatmentBn : result.treatment}</p>
                    <div className="mt-2 pt-2 border-t border-gray-100 font-semibold text-[#1E7743]">
                      <p className="text-xs uppercase mb-1 font-bold">{isBn ? "অনুমোদিত ওষুধ:" : "Medicines:"}</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-gray-800">
                        {(isBn ? result.bangladeshMedicinesBn : result.bangladeshMedicines).map((med, idx) => (
                          <li key={idx}>{med}</li>
                        ))}
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Printer className="w-4 h-4 text-[#1E7743]" />
            <span>{isBn ? "প্রিন্ট / সেভ করুন" : "Print / Save Prescription"}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Share2 className="w-4 h-4 text-[#1E7743]" />
            <span>{isBn ? "শেয়ার করুন" : "Share"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E7743] hover:bg-[#155D33] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isBn ? "অন্য পাতা পরীক্ষা করুন" : "Analyze Another Leaf"}</span>
        </button>
      </div>
    </div>
  );
};
