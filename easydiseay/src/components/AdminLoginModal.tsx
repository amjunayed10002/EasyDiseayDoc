import React, { useState } from "react";
import { Language } from "../types";
import { translations } from "../translations";
import { Lock, X, KeyRound, AlertCircle, Shield } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLoginSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
}) => {
  const t = translations[language];
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the admin passcode.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : null;
      if (res.ok && data.success) {
        onLoginSuccess(data.token);
        setPassword("");
        onClose();
      } else {
        setError(data?.error || `Admin backend returned HTTP ${res.status}.`);
      }
    } catch {
      setError("Cannot reach the admin backend. Check that the deployed /api route is available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="admin-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] flex items-center justify-center mb-3 shadow-xs">
            <Shield className="w-7 h-7" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#1B5E20] uppercase tracking-wider">
            {t.admin.loginTitle}
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mt-1 font-medium">
            {t.admin.loginSubtitle}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1B3022] mb-1">
              Admin Passcode (not User Login Code)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#1B5E20] focus:ring-2 focus:ring-emerald-200 outline-hidden font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            {loading ? "Authenticating..." : t.admin.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
};
