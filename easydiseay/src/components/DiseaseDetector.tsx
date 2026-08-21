import React, { useState, useRef } from "react";
import { Language, AnalysisResult, SampleLeaf } from "../types";
import { sampleLeaves } from "../sampleLeaves";
import { AnalysisResultView } from "./AnalysisResultView";
import { Logo } from "./Logo";
import {
  ArrowLeft,
  Leaf,
  Globe,
  Sprout,
  Image as ImageIcon,
  ArrowUpToLine,
  Camera,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  Stethoscope,
  RefreshCw,
} from "lucide-react";

interface DiseaseDetectorProps {
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onBack?: () => void;
  initialCrop?: string;
  userSession?: { userId: string; fullName: string; role?: string } | null;
  onUserLogout?: () => void;
}

export const DiseaseDetector: React.FC<DiseaseDetectorProps> = ({
  language,
  onLanguageChange,
  onBack,
  initialCrop = "",
  userSession,
  onUserLogout,
}) => {
  const isBn = language === "bn";

  // Upload & selection states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop || "");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage(
        isBn
          ? "অনুগ্রহ করে একটি সঠিক ছবি ফাইল নির্বাচন করুন (JPG, PNG, WEBP)।"
          : "Please select a valid image file (JPG, PNG, WEBP)."
      );
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(
        isBn
          ? "ছবির সাইজ ১৫ মেগাবাইটের বেশি হতে পারবে না।"
          : "Image size exceeds 15MB limit."
      );
      return;
    }

    setErrorMessage(null);
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(1) + " MB");

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Select a preset sample leaf
  const handleSelectSample = (sample: SampleLeaf) => {
    setImagePreview(sample.imageUrl);
    setFileName(sample.id + ".jpg");
    setFileSize("1.8 MB");
    setSelectedCrop(isBn ? sample.cropNameBn : sample.cropName);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  // Live Camera capture support
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMessage(
        isBn
          ? "ক্যামেরা এক্সেস করা সম্ভব হয়নি। ফাইল আপলোড ব্যবহার করুন।"
          : "Unable to access camera. Please use file upload instead."
      );
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImagePreview(dataUrl);
        setFileName("camera_photo_" + Date.now() + ".jpg");
        setFileSize("1.2 MB");
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleResetImage = () => {
    setImagePreview(null);
    setFileName("");
    setFileSize("");
    setAnalysisResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger disease analysis
  const prepareImageForAnalysis = async (image: string): Promise<string> => {
    if (!image.startsWith("data:")) return image;

    const imageElement = new Image();
    imageElement.src = image;
    await new Promise<void>((resolve, reject) => {
      imageElement.onload = () => resolve();
      imageElement.onerror = () => reject(new Error("Unable to prepare image"));
    });

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(imageElement.naturalWidth, imageElement.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(imageElement.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(imageElement.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return image;
    context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.78, 0.65, 0.5, 0.35]) {
      const compressedImage = canvas.toDataURL("image/jpeg", quality);
      if (compressedImage.length <= 2.75 * 1024 * 1024) {
        return compressedImage;
      }
    }

    return canvas.toDataURL("image/jpeg", 0.25);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setErrorMessage(
        isBn
          ? "প্রথমে একটি ফসলের পাতার ছবি নির্বাচন বা আপলোড করুন।"
          : "Please upload or choose a crop image first."
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const preparedImage = await prepareImageForAnalysis(imagePreview);
      const res = await fetch("/api/analyze-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: preparedImage,
          cropHint: selectedCrop,
          language: language,
        }),
      });

      const data = await res.json();
      if (res.ok && data.analysis) {
        setAnalysisResult(data.analysis);
        // Scroll smoothly to the report at the bottom of the page
        setTimeout(() => {
          const el = document.getElementById("analysis-result-card");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      } else {
        setErrorMessage(
          data.error ||
            (isBn
              ? "বিশ্লেষণ ব্যর্থ হয়েছে। অনুগ্রহ করে পরিষ্কার ছবি দিয়ে পুনরায় চেষ্টা করুন।"
              : "Analysis failed. Please try again with a clear photo.")
        );
      }
    } catch (err) {
      console.error("Analysis network error:", err);
      setErrorMessage(
        isBn
          ? "নেটওয়ার্ক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
          : "Network error occurred during diagnosis. Please retry."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFDFB] flex flex-col text-gray-800">
      {/* Top Dedicated Green Header Bar matching Screenshot */}
      <header className="w-full bg-[#1E7743] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        {/* Left: Back button */}
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-1.5 text-white font-medium hover:text-emerald-100 transition-colors cursor-pointer text-sm sm:text-base"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{isBn ? "ফিরে যান" : "Back"}</span>
        </button>

        {/* Center: Brand Title with dynamic Logo */}
        <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base md:text-lg">
          <Logo size="sm" showText={false} />
          <span>{isBn ? "EasyDiseay — ক্রপ ডক্টর" : "EasyDiseay — Crop Doctor"}</span>
        </div>

        {/* Right: User Profile & Language Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {userSession && (
            <div className="hidden sm:flex items-center gap-2 bg-black/20 px-2.5 py-1 rounded-full text-xs font-semibold border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-100">{userSession.fullName || userSession.userId}</span>
              {onUserLogout && (
                <button
                  type="button"
                  onClick={onUserLogout}
                  className="text-emerald-200 hover:text-white underline text-[11px] cursor-pointer ml-1"
                >
                  {isBn ? "লগআউট" : "Logout"}
                </button>
              )}
            </div>
          )}

          <div className="flex items-center bg-white/20 p-0.5 rounded-full border border-white/25">
            <button
              type="button"
              onClick={() => onLanguageChange?.("en")}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                language === "en"
                  ? "bg-white text-[#1E7743] shadow-xs"
                  : "text-white/80 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange?.("bn")}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                language === "bn"
                  ? "bg-white text-[#1E7743] shadow-xs"
                  : "text-white/80 hover:text-white"
              }`}
            >
              বাং
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Page Title & Subtitle */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E7743] tracking-tight">
            {isBn ? "ফসলের রোগ শনাক্তকরণ" : "Crop Disease Detection"}
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            {isBn
              ? "তাৎক্ষণিক রোগ বিশ্লেষণ এবং কার্যকর পরামর্শের জন্য আক্রান্ত পাতার ছবি আপলোড করুন"
              : "Upload a crop image for instant disease analysis and treatment advice"}
          </p>
        </div>

        {/* 2-Column Interface matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Dropzone Area (8 cols) */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-4">
            {!cameraActive ? (
              <div
                id="upload-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!imagePreview) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`relative border-2 border-dashed rounded-3xl text-center bg-white flex flex-col items-center justify-center min-h-[330px] transition-all overflow-hidden ${
                  imagePreview
                    ? "border-emerald-400 p-4 bg-emerald-50/10"
                    : isDragOver
                    ? "border-emerald-500 bg-emerald-50/70 scale-[1.01] p-8 sm:p-12 cursor-pointer"
                    : "border-[#A4D8B8] hover:border-emerald-500 hover:bg-emerald-50/20 p-8 sm:p-12 cursor-pointer"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {imagePreview ? (
                  /* INLINE IMAGE PREVIEW DIRECTLY INSIDE DROPZONE */
                  <div className="w-full flex flex-col items-center justify-center relative group">
                    <div className="relative w-full max-h-[300px] rounded-2xl overflow-hidden bg-gray-900/5 flex items-center justify-center border border-emerald-200/80">
                      <img
                        src={imagePreview}
                        alt="Crop preview"
                        className="w-full max-h-[280px] object-contain rounded-xl transition-transform"
                      />

                      {/* Top Action Overlay buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-[#1E7743] hover:bg-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer backdrop-blur-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{isBn ? "ছবি বদলান" : "Change"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetImage();
                          }}
                          className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                          title={isBn ? "ছবি সরান" : "Remove Image"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom Info Pill */}
                      <div className="absolute bottom-3 left-3 bg-gray-900/75 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{fileName || "crop_leaf.jpg"}</span>
                        <span className="text-emerald-300 font-semibold">• {fileSize || "1.8 MB"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Empty Dropzone UI */
                  <>
                    {/* Picture Icon inside soft green rounded box */}
                    <div className="w-18 h-18 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mb-4 shadow-xs">
                      <ImageIcon className="w-9 h-9 stroke-[1.8]" />
                    </div>

                    <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1">
                      {isBn ? "এখানে আপনার ফসলের পাতার ছবি ড্রপ করুন" : "Drop your crop image here"}
                    </h3>
                    <p className="text-sm text-gray-400 mb-5">
                      {isBn ? "অথবা ফাইল নির্বাচন করতে ক্লিক করুন" : "or click to browse files"}
                    </p>

                    {/* Choose Image Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <ArrowUpToLine className="w-4 h-4 text-gray-500" />
                      <span>{isBn ? "ছবি নির্বাচন করুন" : "Choose Image"}</span>
                    </button>

                    {/* Camera Trigger */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startCamera();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isBn ? "ক্যামেরা দিয়ে ছবি তুলুন" : "Take Photo with Camera"}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Live Camera View */
              <div className="relative rounded-3xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center border-2 border-emerald-500">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-6 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-sm shadow-lg hover:bg-emerald-500 cursor-pointer"
                  >
                    {isBn ? "ছবি তুলুন" : "Capture Photo"}
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-full bg-gray-800/80 text-white font-medium text-sm hover:bg-gray-700 cursor-pointer"
                  >
                    {isBn ? "বাতিল" : "Cancel"}
                  </button>
                </div>
              </div>
            )}

            {/* Sample Images Quick Choice */}
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {isBn
                    ? "অথবা তাৎক্ষণিক পরীক্ষার জন্য একটি নমুনা পাতা বেছে নিন:"
                    : "Or select a sample crop leaf to test instantly:"}
                </span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {sampleLeaves.slice(0, 4).map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      imagePreview === sample.imageUrl
                        ? "border-[#1E7743] bg-emerald-50 ring-1 ring-[#1E7743]"
                        : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
                    }`}
                  >
                    <img
                      src={sample.imageUrl}
                      alt={sample.cropName}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {isBn ? sample.cropNameBn : sample.cropName}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {isBn ? sample.diseaseNameBn : sample.diseaseName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Analyze Card (4 cols) */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-2xl bg-[#FBFDFB] border border-[#D5EAD9] p-5 shadow-xs flex flex-col gap-5">
              {/* Language Section */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-2.5">
                  <Globe className="w-4 h-4 text-[#0284C7]" />
                  <span>{isBn ? "ভাষা (Language)" : "Language"}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onLanguageChange?.("en")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      language === "en"
                        ? "bg-[#1E7743] text-white shadow-xs"
                        : "border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-90">GB</span>
                    <span>English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange?.("bn")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      language === "bn"
                        ? "bg-[#1E7743] text-white shadow-xs"
                        : "border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-90">BD</span>
                    <span>বাংলা</span>
                  </button>
                </div>
              </div>

              {/* Crop Name (optional) Section - Dynamically localized immediately */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1.5">
                  <Sprout className="w-4 h-4 text-[#1E7743]" />
                  <span>
                    {isBn ? "ফসলের নাম " : "Crop Name "}
                    <span className="text-gray-400 font-normal">{isBn ? "(ঐচ্ছিক)" : "(optional)"}</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  placeholder={
                    isBn
                      ? "যেমন: আলু, টমেটো, ধান, গম, মরিচ"
                      : "e.g. Rice, Tomato, Wheat, Potato"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:border-[#1E7743] focus:ring-1 focus:ring-[#1E7743] outline-hidden transition-all"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {isBn ? "অধিক নির্ভুলতার জন্য" : "For more accuracy"}
                </span>
              </div>

              {/* Analyze Crop Action Button */}
              <div>
                <button
                  id="analyze-disease-btn"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !imagePreview}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isAnalyzing
                      ? "bg-[#1E7743] text-white cursor-wait opacity-90"
                      : !imagePreview
                      ? "bg-[#82BA9C] text-white cursor-not-allowed opacity-95"
                      : "bg-[#1E7743] hover:bg-[#155D33] text-white cursor-pointer shadow-md active:scale-[0.99]"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isBn ? "রোগ বিশ্লেষণ করা হচ্ছে..." : "Analyzing..."}</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-4 h-4" />
                      <span>{isBn ? "ফসল পরীক্ষা করুন" : "Analyze Crop"}</span>
                    </>
                  )}
                </button>
                <span className="text-center text-[11px] text-gray-400 mt-2 block">
                  {isBn
                    ? "বিশ্লেষণ শুরু করতে একটি ছবি আপলোড করুন"
                    : "Upload an image to start analysis"}
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diagnosis Results Section directly down on the same page */}
        {analysisResult && (
          <div className="mt-12">
            <AnalysisResultView
              result={analysisResult}
              language={language}
              onReset={() => {
                handleResetImage();
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};
