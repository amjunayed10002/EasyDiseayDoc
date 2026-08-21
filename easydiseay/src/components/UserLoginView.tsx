import React, { useState, useEffect } from "react";
import { Language, ContactAdminInfo } from "../types";
import {
  User,
  LogIn,
  ArrowLeft,
  HelpCircle,
  UserPlus,
  AlertCircle,
  Phone,
  Mail,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface UserLoginViewProps {
  language: Language;
  onLoginSuccess: (userData: { userId: string; fullName: string; role?: string }) => void;
  onBackToHome: () => void;
}

export const UserLoginView: React.FC<UserLoginViewProps> = ({
  language,
  onLoginSuccess,
  onBackToHome,
}) => {
  const isBn = language === "bn";
  const [subView, setSubView] = useState<"login" | "contactAdmin">("login");
  const [userId, setUserId] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Admin Contact Info from Settings
  const [contactInfo, setContactInfo] = useState<ContactAdminInfo>({
    email: "315222057@hamdarduniversity.edu.bd",
    phone: "+880123456789",
    description: "Forget anything send us email with mention your User ID",
    displayStyle: "card_green",
  });

  // User Registration Request State
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regNotes, setRegNotes] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.contactAdmin) {
          setContactInfo(data.contactAdmin);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !loginCode.trim()) {
      setErrorMessage(
        isBn
          ? "ইউজার আইডি এবং লগইন কোড প্রদান করুন।"
          : "Please enter both User ID and Login Code."
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim(), loginCode: loginCode.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("easydiseay_user_session", JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(
          data.error ||
            (isBn
              ? "ইউজার আইডি বা লগইন কোড ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
              : "Invalid User ID or Login Code. Please check or contact admin.")
        );
      }
    } catch {
      setErrorMessage(
        isBn
          ? "নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
          : "Network error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendRegistrationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim()) {
      setRegError(isBn ? "পূর্ণ নাম ও ইমেইল আবশ্যক।" : "Full Name and Email are required.");
      return;
    }

    setRegSubmitting(true);
    setRegError(null);

    try {
      const res = await fetch("/api/registration-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          notes: regNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegSuccess(true);
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegSuccess(false);
          setRegFullName("");
          setRegEmail("");
          setRegPhone("");
          setRegNotes("");
        }, 3000);
      } else {
        setRegError(data.error || "Failed to submit request. Please try again.");
      }
    } catch {
      setRegError("Network error. Please try again.");
    } finally {
      setRegSubmitting(false);
    }
  };

  // ==========================================
  // VIEW 1: CONTACT ADMIN (Matching Image 1 & 2)
  // ==========================================
  if (subView === "contactAdmin") {
    return (
      <div
        id="contact-admin-page"
        className="min-h-screen bg-[#F7FAF7] flex flex-col items-center justify-center p-4 sm:p-6"
      >
        <div className="w-full max-w-lg flex flex-col items-center">
          {/* Top Circular Icon matching Screenshot 1 & 2 */}
          <div className="w-16 h-16 rounded-full bg-[#E8F5E9] border border-emerald-100 flex items-center justify-center mb-4 shadow-xs">
            <Mail className="w-8 h-8 text-[#1E7743] stroke-[2.2]" />
          </div>

          {/* Page Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E7743] tracking-tight text-center">
            {isBn ? "অ্যাডমিনের সাথে যোগাযোগ" : "Contact Admin"}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 mb-6 text-center">
            {isBn
              ? "আপনার ইউজার আইডি এবং লগইন কোড পেতে যোগাযোগ করুন"
              : "Contact us to get your User ID and Login Code"}
          </p>

          {/* Outer White Card Container matching Pic 1 */}
          <div className="w-full bg-white rounded-3xl border border-gray-200/80 shadow-lg p-6 sm:p-8 flex flex-col items-center">
            {/* Style 1: Solid Green Highlight Box matching Pic 1 */}
            {contactInfo.displayStyle !== "card_dual" ? (
              <div className="w-full bg-[#1E7743] text-white rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xs">
                {/* Main Contact Value (Email or Phone) */}
                <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-wide text-white break-all select-all">
                  {contactInfo.email || contactInfo.phone || "315222057@hamdarduniversity.edu.bd"}
                </h2>

                {/* Optional Phone if both exist */}
                {contactInfo.phone && contactInfo.email && (
                  <p className="text-xs font-mono text-emerald-200 mt-1">
                    Phone: {contactInfo.phone}
                  </p>
                )}

                {/* Divider Line */}
                <div className="w-full border-t border-emerald-600/80 my-3.5" />

                {/* Little Description text editable by Admin */}
                <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-sm">
                  {contactInfo.description ||
                    (isBn
                      ? "লগইন কোড ভুলে গেলে আপনার ইউজার আইডি উল্লেখ করে ইমেইল বা ফোন করুন"
                      : "Forget anything send us email with mention your User ID")}
                </p>
              </div>
            ) : (
              /* Style 2: Dual Cards matching Pic 2 */
              <div className="w-full space-y-3">
                {/* Admin Email Box */}
                {contactInfo.email && (
                  <div className="p-4 bg-[#F2F8F3] rounded-2xl border border-emerald-100 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1E7743] flex items-center justify-center text-white shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                        ADMIN EMAIL
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate select-all">
                        {contactInfo.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Phone Box */}
                {contactInfo.phone && (
                  <div className="p-4 bg-[#F2F8F3] rounded-2xl border border-emerald-100 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1E7743] flex items-center justify-center text-white shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                        ADMIN PHONE
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate select-all">
                        {contactInfo.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                {contactInfo.description && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    {contactInfo.description}
                  </p>
                )}
              </div>
            )}

            {/* Back to Login Button */}
            <button
              type="button"
              onClick={() => setSubView("login")}
              className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? "লগইনে ফিরে যান" : "Back to Login"}</span>
            </button>
          </div>

          {/* Footer note matching Pic 1 & 2 */}
          <div className="flex flex-col items-center gap-2 mt-4 text-xs">
            <button
              type="button"
              onClick={onBackToHome}
              className="text-[#1E7743] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? "মূল পাতায় ফিরে যান" : "Back to Home"}</span>
            </button>
            <span className="text-gray-400 text-[11px]">
              Contact your system admin if you need access
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: USER LOGIN (Default Screen)
  // ==========================================
  return (
    <div
      id="security-user-login-page"
      className="min-h-screen bg-[#F7FAF7] flex flex-col items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Top Circular User Avatar Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-[#2E7D32] flex items-center justify-center mb-4 shadow-xs">
          <User className="w-9 h-9 text-[#2E7D32] stroke-[2.2]" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-[#1E7743] tracking-tight text-center">
          {isBn ? "ইউজার লগইন" : "User Login"}
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 mb-6 text-center">
          {isBn
            ? "ডিজিটাল ক্রপ ডক্টর অ্যাক্সেস করতে লগইন করুন"
            : "Login required to access Crop Doctor Digital"}
        </p>

        {/* Login Card */}
        <div className="w-full bg-white rounded-3xl border border-gray-200/80 shadow-lg p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* User ID Field */}
            <div>
              <label
                htmlFor="user-id-input"
                className="block text-xs font-bold text-gray-700 mb-1.5"
              >
                {isBn ? "ইউজার আইডি (User ID)" : "User ID"}
              </label>
              <input
                id="user-id-input"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. ED11694 or farmer_karim"
                className="w-full bg-[#EBF3FE] border border-[#D5E5FC] text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium placeholder-gray-400"
                required
              />
            </div>

            {/* Login Code Field */}
            <div>
              <label
                htmlFor="login-code-input"
                className="block text-xs font-bold text-gray-700 mb-1.5"
              >
                {isBn ? "লগইন কোড (Login Code)" : "Login Code"}
              </label>
              <input
                id="login-code-input"
                type="password"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#EBF3FE] border border-[#D5E5FC] text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium placeholder-gray-400"
                required
              />
            </div>

            {/* Green Login CTA Button matching screenshot */}
            <button
              id="user-submit-login-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base transition-all cursor-pointer border-none mt-2"
            >
              <LogIn className="w-5 h-5" />
              <span>
                {loading
                  ? isBn
                    ? "যাচাই করা হচ্ছে..."
                    : "Verifying..."
                  : isBn
                  ? "লগইন করুন"
                  : "Login"}
              </span>
            </button>
          </form>

          {/* Bottom Action Links matching request & focus elements */}
          <div className="mt-6 flex flex-col items-center gap-3 text-xs">
            {/* 1. Forget Login Code -> Opens Contact Admin (Pic 1) */}
            <button
              type="button"
              onClick={() => setSubView("contactAdmin")}
              className="text-gray-600 hover:text-emerald-700 flex items-center gap-1.5 font-medium cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
              <span>{isBn ? "লগইন কোড ভুলে গেছেন? অ্যাডমিনের সাথে যোগাযোগ" : "Forget Login Code? Contact Admin"}</span>
            </button>

            {/* 2. Don't have ID? Register -> Opens Request Box */}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="text-[#1E7743] hover:text-[#155D33] flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#1E7743]" />
              <span>{isBn ? "আইডি নেই? নিবন্ধন অনুরোধ পাঠান" : "Don't have an ID? Register"}</span>
            </button>

            {/* 3. Back to Home */}
            <button
              type="button"
              onClick={onBackToHome}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5 font-bold cursor-pointer transition-colors mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? "মূল পাতায় ফিরে যান" : "Back to Home"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: DON'T HAVE ID? REGISTRATION REQUEST */}
      {/* ========================================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1E7743]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {isBn ? "নিবন্ধন ও অ্যাক্সেস অনুরোধ" : "Request User ID & Login Code"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {isBn
                    ? "আপনার তথ্য পাঠান, অ্যাডমিন আপনাকে আইডি প্রদান করবেন"
                    : "Send your details to the Admin to receive authorized access"}
                </p>
              </div>
            </div>

            {regSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center space-y-2 my-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                <h4 className="text-sm font-bold text-emerald-900">Request Sent to Admin!</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  {isBn
                    ? "আপনার অনুরোধ অ্যাডমিনের প্যানেলে জমা হয়েছে। অ্যাডমিন যাচাই করে আপনাকে ইউনিক আইডি (EDxxxx) প্রদান করবেন।"
                    : "Your details have been submitted to the Admin Panel. The admin will review and assign your unique ID (EDxxxx) and Login Code."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRegistrationRequest} className="space-y-3 text-xs mt-3">
                {regError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
                    {regError}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isBn ? "পূর্ণ নাম (Full Name) *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Md. Aminul Islam"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isBn ? "ইমেইল এড্রেস (Email Address) *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aminul.farmer@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isBn ? "মোবাইল নম্বর (Phone Number)" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isBn ? "ফসলের বিবরণ / মন্তব্য (Crop Details / Notes)" : "Crop Details / Reason"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tomato & Potato Farmer from Bogura"
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={regSubmitting}
                    className="px-5 py-2.5 bg-[#1E7743] hover:bg-[#155D33] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{regSubmitting ? "Sending..." : isBn ? "অনুরোধ পাঠান" : "Submit Request"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
