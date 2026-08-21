import React, { useState, useEffect } from "react";
import {
  Language,
  AnalysisResult,
  MedicineItem,
  DiseaseItem,
  RegisteredUser,
  RegistrationRequest,
  ContactAdminInfo,
  SupportedCrop,
} from "../types";
import { translations } from "../translations";
import { Logo } from "./Logo";
import { AdminAnalytics } from "./AdminAnalytics";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Image as ImageIcon,
  Activity,
  Pill,
  Users,
  Settings,
  LogOut,
  Search,
  Trash2,
  Eye,
  Plus,
  TrendingUp,
  X,
  CheckCircle2,
  PhoneCall,
  Upload,
  RefreshCw,
  Lock,
  Shield,
  KeyRound,
  UserPlus,
  ShieldCheck,
  Mail,
  Phone,
  Sparkles,
  Inbox,
  UserCheck,
  Copy,
  Check,
} from "lucide-react";

interface AdminDashboardProps {
  language: Language;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  onLogout,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "history" | "diseases" | "medicines" | "activity" | "settings"
  >("overview");

  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [diseases, setDiseases] = useState<DiseaseItem[]>([]);
  const [stats, setStats] = useState({
    totalAnalyses: 1248,
    totalImages: 1154,
    todayAnalyses: 32,
    totalUsers: 892,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<AnalysisResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Logo Management State
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [logoInputUrl, setLogoInputUrl] = useState<string>("");
  const [logoSavedMessage, setLogoSavedMessage] = useState<string | null>(null);

  // Security Mode & Registered Users State
  const [securityMode, setSecurityMode] = useState<boolean>(false);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New User Form State matching Picture 3 (EDxxxx)
  const [newUser, setNewUser] = useState({
    userId: "",
    loginCode: "",
    fullName: "",
    email: "",
    phone: "",
    role: "Registered Farmer",
    requestId: "",
  });
  const [userActionMessage, setUserActionMessage] = useState<string | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [currentAdminPassword, setCurrentAdminPassword] = useState("");

  // Contact Admin Screen Settings (Pic 1 & 2)
  const [contactAdminSettings, setContactAdminSettings] = useState<ContactAdminInfo>({
    email: "315222057@hamdarduniversity.edu.bd",
    phone: "+880123456789",
    description: "Forget anything send us email with mention your User ID",
    displayStyle: "card_green",
  });
  const [contactSavedMessage, setContactSavedMessage] = useState<string | null>(null);
  const [supportedCrops, setSupportedCrops] = useState<SupportedCrop[]>([]);
  const [newSupportedCrop, setNewSupportedCrop] = useState({ name: "", nameBn: "", imageUrl: "" });

  // Helper: Generate unique ID starting with ED + 4-5 digits e.g. ED11694
  const generateRandomEDId = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `ED${randomNum}`;
  };

  const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Trigger Add User Form with fresh random EDxxxx
  const handleOpenAddUser = (prefill?: Partial<typeof newUser>) => {
    setNewUser({
      userId: generateRandomEDId(),
      loginCode: generateRandomCode(),
      fullName: prefill?.fullName || "",
      email: prefill?.email || "",
      phone: prefill?.phone || "",
      role: prefill?.role || "Registered Farmer",
      requestId: prefill?.requestId || "",
    });
    setShowNewUserForm(true);
  };

  // Regenerate ID button
  const handleRegenerateId = () => {
    setNewUser((prev) => ({ ...prev, userId: generateRandomEDId() }));
  };

  // Regenerate Code button
  const handleRegenerateCode = () => {
    setNewUser((prev) => ({ ...prev, loginCode: generateRandomCode() }));
  };

  // New Disease & Medicine modal states
  const [showAddDisease, setShowAddDisease] = useState(false);
  const [newDisease, setNewDisease] = useState({
    name: "",
    nameBn: "",
    crop: "Tomato",
    cropBn: "টমেটো",
    pathogen: "Alternaria solani",
    severity: "High" as "High" | "Medium" | "Low",
    commonMedicines: "Antracol 70 WP, Score 250 EC",
  });

  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({
    brandName: "",
    genericName: "",
    company: "Syngenta Bangladesh Ltd.",
    targetDiseases: "Early Blight, Late Blight",
    cropTypes: "Tomato, Potato",
    dosage: "2g per 1 Liter water",
    dosageBn: "প্রতি লিটার পানিতে ২ গ্রাম",
    packSize: "100g, 500g",
  });

  // Fetch data
  const fetchData = async () => {
    try {
      const [resAnalyses, resStats, resMeds, resDis, resSettings, resUsers, resReqs, resCrops] = await Promise.all([
        fetch("/api/analyses", { cache: "no-store" }),
        fetch("/api/stats", { cache: "no-store" }),
        fetch("/api/medicines", { cache: "no-store" }),
        fetch("/api/diseases", { cache: "no-store" }),
        fetch("/api/settings", { cache: "no-store" }),
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/registration-requests", { cache: "no-store" }),
        fetch("/api/supported-crops", { cache: "no-store" }),
      ]);

      if (resAnalyses.ok) {
        const d = await resAnalyses.json();
        setAnalyses(d.data || []);
      }
      if (resStats.ok) {
        const s = await resStats.json();
        setStats(s);
      }
      if (resMeds.ok) {
        const m = await resMeds.json();
        setMedicines(m);
      }
      if (resDis.ok) {
        const di = await resDis.json();
        setDiseases(di);
      }
      if (resSettings.ok) {
        const sett = await resSettings.json();
        if (sett.customLogo) {
          setCurrentLogo(sett.customLogo);
        } else {
          const local = localStorage.getItem("easydiseay_custom_logo");
          setCurrentLogo(local || null);
        }
        if (sett.loginRequired !== undefined) {
          setSecurityMode(sett.loginRequired);
          localStorage.setItem("easydiseay_security_mode", JSON.stringify(sett.loginRequired));
        }
        if (sett.contactAdmin) {
          setContactAdminSettings(sett.contactAdmin);
        }
      }
      if (resUsers.ok) {
        const u = await resUsers.json();
        setRegisteredUsers(u);
      }
      if (resReqs.ok) {
        const reqs = await resReqs.json();
        setRegistrationRequests(reqs);
      }
      if (resCrops.ok) {
        const crops = await resCrops.json();
        setSupportedCrops(Array.isArray(crops) ? crops : []);
      }
    } catch (e) {
      console.error("Error fetching admin data:", e);
    }
  };

  const handleToggleSecurityMode = async () => {
    const nextState = !securityMode;
    try {
      const res = await fetch("/api/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginRequired: nextState }),
      });
      if (res.ok) {
        setSecurityMode(nextState);
        localStorage.setItem("easydiseay_security_mode", JSON.stringify(nextState));
        window.dispatchEvent(new Event("easydiseay_security_mode_changed"));
        setUserActionMessage(
          nextState
            ? "Security Mode Activated! Login is now REQUIRED globally to access Disease Detection."
            : "Security Mode Disabled! Anyone can now access Disease Detection without login."
        );
        setTimeout(() => setUserActionMessage(null), 4000);
      }
    } catch (err) {
      console.error("Failed to toggle security mode:", err);
    }
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings/admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentAdminPassword, password: adminPasswordInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUserActionMessage(data.error || "Unable to change the admin password.");
        return;
      }
      setAdminPasswordInput("");
      setCurrentAdminPassword("");
      setUserActionMessage("Admin password changed successfully.");
      setTimeout(() => setUserActionMessage(null), 4000);
    } catch {
      setUserActionMessage("Unable to reach the admin settings service.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.userId.trim() || !newUser.loginCode.trim()) {
      alert("Please provide both User ID and Login Code.");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegisteredUsers((prev) => [data.user, ...prev]);
        if (newUser.requestId) {
          setRegistrationRequests((prev) => prev.filter((r) => r.id !== newUser.requestId));
        }
        setShowNewUserForm(false);
        setUserActionMessage(`User "${data.user.userId}" registered and granted access successfully!`);
        setTimeout(() => setUserActionMessage(null), 4000);
      } else {
        alert(data.error || "Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  const handleDeleteUser = async (id: string, userId: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userId}"?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRegisteredUsers((prev) => prev.filter((u) => u.id !== id && u.userId !== id));
        setUserActionMessage(`User "${userId}" deleted.`);
        setTimeout(() => setUserActionMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleApproveRegistrationRequest = async (request: RegistrationRequest) => {
    try {
      const res = await fetch(`/api/registration-requests/${request.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setRegisteredUsers((prev) => [data.user, ...prev]);
        setRegistrationRequests((prev) =>
          prev.map((item) => item.id === request.id ? { ...item, status: "approved" } : item)
        );
        setUserActionMessage(
          `Approved ${request.fullName}. User ID: ${data.user.userId} | Login Code: ${data.user.loginCode}`
        );
        setTimeout(() => setUserActionMessage(null), 10000);
      } else {
        setUserActionMessage(data.error || "Unable to approve registration request.");
      }
    } catch {
      setUserActionMessage("Unable to reach the registration service.");
    }
  };

  const handleDeleteRegistrationRequest = async (id: string) => {
    if (!window.confirm("Reject this registration request?")) return;
    try {
      const res = await fetch(`/api/registration-requests/${id}/reject`, { method: "POST" });
      if (res.ok) {
        setRegistrationRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
        setUserActionMessage("Registration request rejected.");
        setTimeout(() => setUserActionMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const handleSaveContactAdminSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactAdminSettings),
      });
      if (res.ok) {
        setContactSavedMessage("Contact Admin screen information updated successfully!");
        setTimeout(() => setContactSavedMessage(null), 4000);
      }
    } catch (err) {
      console.error("Error updating contact admin settings:", err);
    }
  };

  const handleCopyCredentials = (u: RegisteredUser) => {
    const text = `EasyDiseay Login Details:\nUser ID: ${u.userId}\nLogin Code: ${u.loginCode}\nName: ${u.fullName}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setLogoInputUrl(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async (logoToSave?: string) => {
    const target = logoToSave !== undefined ? logoToSave : logoInputUrl.trim();
    if (!target) return;

    try {
      const res = await fetch("/api/settings/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo: target }),
      });
      if (res.ok) {
        setCurrentLogo(target);
        localStorage.setItem("easydiseay_custom_logo", target);
        window.dispatchEvent(new Event("easydiseay_logo_changed"));
        setLogoInputUrl("");
        setLogoSavedMessage("Logo updated successfully! All pages now reflect the new logo.");
        setTimeout(() => setLogoSavedMessage(null), 4000);
      }
    } catch (err) {
      console.error("Failed to save logo:", err);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm("Are you sure you want to remove the custom logo and reset to default?")) return;
    try {
      const res = await fetch("/api/settings/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo: null }),
      });
      if (res.ok) {
        setCurrentLogo(null);
        localStorage.removeItem("easydiseay_custom_logo");
        window.dispatchEvent(new Event("easydiseay_logo_changed"));
        setLogoInputUrl("");
        setLogoSavedMessage("Custom logo removed. Default logo restored across all pages.");
        setTimeout(() => setLogoSavedMessage(null), 4000);
      }
    } catch (err) {
      console.error("Failed to remove logo:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete analysis
  const handleDeleteAnalysis = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this diagnosis record?")) return;
    try {
      const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAnalyses((prev) => prev.filter((a) => a.id !== id));
        setStats((prev) => ({ ...prev, totalAnalyses: prev.totalAnalyses - 1 }));
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  // Add new disease
  const handleCreateDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/diseases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newDisease,
          commonMedicines: newDisease.commonMedicines.split(",").map((s) => s.trim()),
        }),
      });
      if (res.ok) {
        setShowAddDisease(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add new medicine
  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMed,
          targetDiseases: newMed.targetDiseases.split(",").map((s) => s.trim()),
          cropTypes: newMed.cropTypes.split(",").map((s) => s.trim()),
        }),
      });
      if (res.ok) {
        setShowAddMed(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSupportedCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/supported-crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSupportedCrop),
    });
    const data = await res.json();
    if (res.ok && data.crop) {
      setSupportedCrops((previous) => [data.crop, ...previous]);
      setNewSupportedCrop({ name: "", nameBn: "", imageUrl: "" });
    }
  };

  const handleDeleteSupportedCrop = async (id: string) => {
    if (!window.confirm("Remove this supported crop from the public page?")) return;
    const res = await fetch(`/api/supported-crops/${id}`, { method: "DELETE" });
    if (res.ok) setSupportedCrops((previous) => previous.filter((crop) => crop.id !== id));
  };

  const handleSupportedCropImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewSupportedCrop((previous) => ({ ...previous, imageUrl: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };

  // Filtered analyses
  const filteredAnalyses = analyses.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.crop.toLowerCase().includes(q) ||
      a.cropBn.includes(q) ||
      a.disease.toLowerCase().includes(q) ||
      a.diseaseBn.includes(q)
    );
  });

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-[#F9FBF9] flex flex-col md:flex-row text-[#1B3022]">
      {/* Dark Green Left Sidebar matching Vibrant Palette */}
      <aside
        id="admin-sidebar"
        className="w-full md:w-64 bg-[#1B3022] text-white flex flex-col justify-between shrink-0 p-5 border-r border-emerald-900/80"
      >
        <div>
          {/* Brand Logo in sidebar */}
          <div className="mb-8 pt-2">
            <Logo size="md" />
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5 text-sm font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "overview"
                  ? "bg-[#1B5E20] text-[#FFD54F] font-black shadow-xs"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "analytics"
                  ? "bg-[#1B5E20] text-[#FFD54F] font-black shadow-xs"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Traffic</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "history"
                  ? "bg-[#1B5E20] text-[#FFD54F] font-black shadow-xs"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Analysis History</span>
            </button>

            <button
              onClick={() => setActiveTab("diseases")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "diseases"
                  ? "bg-[#1B5E20] text-[#FFD54F] font-black shadow-xs"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Disease Management</span>
            </button>

            <button
              onClick={() => setActiveTab("medicines")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "medicines"
                  ? "bg-[#1B5E20] text-[#FFD54F] font-black shadow-xs"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Medicine Management</span>
            </button>

            <button
              onClick={() => setActiveTab("activity")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "activity"
                  ? "bg-[#18683B] text-amber-300 font-bold shadow-xs"
                  : "text-emerald-100/80 hover:bg-emerald-800 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users / Activity</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "settings"
                  ? "bg-[#18683B] text-amber-300 font-bold shadow-xs"
                  : "text-emerald-100/80 hover:bg-emerald-800 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="pt-6 border-t border-emerald-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-200 hover:bg-red-900/40 hover:text-red-100 font-medium text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {/* Top Bar with Admin Avatar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Admin Dashboard
          </h1>

          <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-xs">
            <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
              👨‍💼
            </div>
            <span className="text-xs font-bold text-gray-800">Admin</span>
          </div>
        </div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top 4 KPI Metric Cards matching screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Analyses */}
              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Total Analyses
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {stats.totalAnalyses.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Total Images */}
              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Total Images
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {stats.totalImages.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Today's Analyses */}
              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Today's Analyses
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {stats.todayAnalyses}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Total Users */}
              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Total Users
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Analytics & Traffic Feature Card */}
            <div className="bg-linear-to-r from-[#1B5E20] to-[#144A1A] p-5 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FFD54F]/20 text-[#FFD54F] flex items-center justify-center shrink-0">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#FFD54F]">
                    Visitor & Crop Search Analytics (24h Auto-Reset Active)
                  </h4>
                  <p className="text-xs text-white/80 mt-0.5">
                    View detailed traffic metrics for 1 day, 2 days, 1 week, 1 month, and 1 year, including top searched crops/fruits.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("analytics")}
                className="px-4 py-2 bg-[#FFD54F] hover:bg-[#ffe082] text-[#1B5E20] font-black text-xs rounded-xl transition-all shadow-xs shrink-0 cursor-pointer text-center"
              >
                Open Analytics &rarr;
              </button>
            </div>

            {/* Bottom 2-Column Section: Recent Analyses & Recent Uploaded Images */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left (7 cols): Recent Analyses Table */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900">
                    Recent Analyses
                  </h3>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3 px-2">Image</th>
                        <th className="pb-3 px-2">Crop</th>
                        <th className="pb-3 px-2">Disease</th>
                        <th className="pb-3 px-2">Date</th>
                        <th className="pb-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {filteredAnalyses.slice(0, 6).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-2.5 px-2">
                            <img
                              src={item.imageUrl}
                              alt={item.crop}
                              onClick={() => setPreviewImage(item.imageUrl)}
                              className="w-8 h-8 rounded-md object-cover cursor-pointer hover:opacity-80"
                            />
                          </td>
                          <td className="py-2.5 px-2 font-medium text-gray-900">
                            {item.crop} Leaf
                          </td>
                          <td className="py-2.5 px-2 text-gray-800">
                            {item.disease}
                          </td>
                          <td className="py-2.5 px-2 text-gray-500">
                            {item.date}
                          </td>
                          <td className="py-2.5 px-2 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedRecord(item)}
                              title="View details"
                              className="p-1 hover:text-emerald-600 rounded text-gray-400"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnalysis(item.id)}
                              title="Delete"
                              className="p-1 hover:text-red-600 rounded text-gray-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right (5 cols): Recent Uploaded Images Grid matching screenshot */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    Recent Uploaded Images
                  </h3>

                  {/* 8-Photo Grid (4x2 or 2x4) */}
                  <div className="grid grid-cols-4 gap-2.5 mb-6">
                    {analyses.slice(0, 8).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(item.imageUrl)}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-2xs hover:shadow-md"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.crop}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                          {item.crop}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("images")}
                  className="w-full py-2.5 rounded-xl bg-[#146C3D] hover:bg-[#0E522C] text-white text-xs font-bold transition-all text-center shadow-xs"
                >
                  View All Images
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics & Traffic Tab */}
        {activeTab === "analytics" && (
          <AdminAnalytics language={language} />
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-gray-900">All Diagnosis Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase">
                    <th className="pb-3 px-2">Image</th>
                    <th className="pb-3 px-2">Crop</th>
                    <th className="pb-3 px-2">Disease</th>
                    <th className="pb-3 px-2">Recommended Medicines</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analyses.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-2">
                        <img
                          src={item.imageUrl}
                          alt={item.crop}
                          className="w-9 h-9 rounded-md object-cover"
                        />
                      </td>
                      <td className="py-2.5 px-2 font-bold text-gray-900">{item.crop} ({item.cropBn})</td>
                      <td className="py-2.5 px-2 font-semibold text-emerald-800">{item.disease}</td>
                      <td className="py-2.5 px-2 text-gray-600 max-w-xs truncate">
                        {item.bangladeshMedicines.join(", ")}
                      </td>
                      <td className="py-2.5 px-2 text-gray-500">{item.date}</td>
                      <td className="py-2.5 px-2 text-right space-x-2">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="text-emerald-700 font-semibold hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteAnalysis(item.id)}
                          className="text-red-600 font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "diseases" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Crop Disease Knowledge Base</h3>
              <button
                onClick={() => setShowAddDisease(true)}
                className="px-4 py-2 bg-[#146C3D] hover:bg-[#0E522C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Disease</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {diseases.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-800">{d.crop} ({d.cropBn})</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                        {d.severity}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{d.name}</h4>
                    <p className="text-xs text-gray-500 mb-2 italic">{d.pathogen}</p>
                    <div className="text-xs text-gray-700">
                      <span className="font-semibold">Suggested: </span>
                      {d.commonMedicines.join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medicine Management Tab */}
        {activeTab === "medicines" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Bangladeshi Registered Agro-Medicines</h3>
              <button
                onClick={() => setShowAddMed(true)}
                className="px-4 py-2 bg-[#146C3D] hover:bg-[#0E522C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicines.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {m.company}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">{m.brandName}</h4>
                    <p className="text-xs text-gray-500 mb-2 font-mono">{m.genericName}</p>
                    <div className="text-xs text-gray-700 space-y-1">
                      <p><span className="font-semibold">Dosage:</span> {m.dosage}</p>
                      <p><span className="font-semibold">Crops:</span> {m.cropTypes.join(", ")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity & Users Tab */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            {/* Notification Toast */}
            {userActionMessage && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{userActionMessage}</span>
              </div>
            )}

            {/* Pending Registration Requests Section (User submitted from "Don't have ID? Register") */}
            {registrationRequests.some((r) => r.status === "pending") && (
              <div className="bg-gradient-to-br from-amber-50/80 to-emerald-50/50 p-6 rounded-3xl border border-amber-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Pending Registration Requests ({registrationRequests.length})
                      </h3>
                      <p className="text-xs text-gray-600">
                        Users who submitted details via &quot;Don&apos;t have an ID? Register&quot; on the login page.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold animate-pulse">
                    Action Required
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {registrationRequests.filter((req) => req.status === "pending").map((req) => (
                    <div
                      key={req.id}
                      className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">{req.fullName}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{req.createdAt}</span>
                        </div>
                        <div className="text-gray-600 space-y-0.5">
                          {req.email && (
                            <p className="flex items-center gap-1.5 text-gray-700">
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="font-medium">{req.email}</span>
                            </p>
                          )}
                          {req.phone && (
                            <p className="flex items-center gap-1.5 text-gray-700">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="font-mono">{req.phone}</span>
                            </p>
                          )}
                          {req.notes && (
                            <p className="text-gray-500 italic bg-gray-50 p-2 rounded-lg mt-1 text-[11px]">
                              &quot;{req.notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Admin Decision Buttons for Request */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleDeleteRegistrationRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveRegistrationRequest(req)}
                          className="px-4 py-1.5 bg-[#146C3D] hover:bg-[#0E522C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Approve &amp; Assign ED-ID</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registered Users Directory Card - Strictly styled matching Picture 3 (image.png) */}
            <div id="registered-users-panel" className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200/90 shadow-sm space-y-6">
              {/* Header matching Picture 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100/70 text-[#146C3D] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Registered Users</h3>
                    <p className="text-xs text-gray-500 font-medium">Authorized users permitted to access the disease detector</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search Bar with light-blue pill matching Picture 3 */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="bg-[#EBF3FE] border border-[#D5E5FC] text-gray-800 placeholder-gray-400 rounded-2xl px-4 py-2.5 text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>

                  {/* + Add User Button matching Picture 3 with #70B18B */}
                  <button
                    type="button"
                    onClick={() => handleOpenAddUser()}
                    className="px-5 py-2.5 bg-[#70B18B] hover:bg-[#5C9E78] active:scale-98 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              {/* NEW USER REGISTRATION Form strictly matching Picture 3 (image.png) */}
              {showNewUserForm && (
                <div className="p-6 rounded-2xl bg-[#F8FAF8] border-2 border-dashed border-[#70B18B]/60 animate-in fade-in space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black tracking-wider uppercase text-[#146C3D]">
                      NEW USER REGISTRATION
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowNewUserForm(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUser} className="space-y-4">
                    {/* 4 Fields Grid matching Picture 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      {/* 1. Generated ID with ED-random digits */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1.5">Generated ID</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={newUser.userId}
                            onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-mono font-bold text-sm text-[#146C3D] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            placeholder="e.g. ED11694"
                          />
                          <button
                            type="button"
                            onClick={handleRegenerateId}
                            title="Generate a new random ED ID"
                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-emerald-700 cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 2. Full Name */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter Name"
                          value={newUser.fullName}
                          onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* 3. Email */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1.5">Email</label>
                        <input
                          type="email"
                          placeholder="Enter Email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* 4. Login Code */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1.5">Login Code</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Enter Code"
                            value={newUser.loginCode}
                            onChange={(e) => setNewUser({ ...newUser, loginCode: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-mono font-medium text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleRegenerateCode}
                            title="Generate a new random code"
                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-emerald-700 cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons on the right matching Picture 3 */}
                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewUserForm(false)}
                        className="text-gray-600 hover:text-gray-900 font-bold text-xs sm:text-sm mr-4 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-7 py-2.5 bg-[#146C3D] hover:bg-[#0E522C] active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all"
                      >
                        Save User
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Table matching Picture 3: User ID | Name | Email | Code | Status | Actions */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-[#146C3D] font-bold text-xs">User ID</th>
                      <th className="py-3 px-4 text-[#146C3D] font-bold text-xs">Name</th>
                      <th className="py-3 px-4 text-[#146C3D] font-bold text-xs">Email</th>
                      <th className="py-3 px-4 text-[#146C3D] font-bold text-xs">Code</th>
                      <th className="py-3 px-4 text-[#146C3D] font-bold text-xs">Status</th>
                      <th className="py-3 px-4 text-[#146C3D] font-bold text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {registeredUsers
                      .filter((u) => {
                        if (!userSearchQuery.trim()) return true;
                        const q = userSearchQuery.toLowerCase();
                        return (
                          u.userId.toLowerCase().includes(q) ||
                          (u.fullName && u.fullName.toLowerCase().includes(q)) ||
                          (u.email && u.email.toLowerCase().includes(q))
                        );
                      })
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                          {/* User ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#146C3D] text-sm">
                            {u.userId}
                          </td>

                          {/* Full Name */}
                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            {u.fullName || "—"}
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-4 text-gray-600 font-medium">
                            {u.email || "—"}
                          </td>

                          {/* Code with quick copy */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 font-medium">
                              {u.loginCode}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Active
                            </span>
                          </td>

                          {/* Actions: Copy & Delete */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyCredentials(u)}
                                className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
                                title="Copy Login Credentials"
                              >
                                {copiedId === u.id ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.userId)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {registeredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          No registered users found. Click &quot;+ Add User&quot; to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagnostic Activity */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900">Recent User Diagnostics Activity</h3>
              <div className="space-y-2.5">
                {analyses.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="font-bold text-gray-800">
                          Farmer requested diagnosis for <span className="text-emerald-700">{a.crop}</span>
                        </p>
                        <p className="text-gray-500">Identified: {a.disease}</p>
                      </div>
                    </div>
                    <span className="text-gray-400 font-medium">{a.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-3xl">
            {/* Notification Toasts */}
            {(logoSavedMessage || userActionMessage || contactSavedMessage) && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{logoSavedMessage || userActionMessage || contactSavedMessage}</span>
              </div>
            )}

            {/* System Security Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-[#1E7743] border-b border-gray-100 pb-3">
                <Lock className="w-5 h-5 text-[#1E7743] stroke-[2.2]" />
                <h3 className="text-base font-bold text-gray-900">System Security</h3>
              </div>

              {/* Login Required Toggle Row */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAF8] border border-gray-200/80 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Login Required</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {securityMode
                      ? "Login required to access Crop Doctor Digital"
                      : "Anyone can access without login"}
                  </p>
                </div>

                {/* Toggle switch button */}
                <button
                  type="button"
                  onClick={handleToggleSecurityMode}
                  className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                    securityMode ? "bg-emerald-600 justify-end" : "bg-gray-200 justify-start"
                  }`}
                  aria-label="Toggle Security Mode"
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md block transition-transform" />
                </button>
              </div>

              <div className="flex items-start gap-2 p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-[11px] text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Status: </span>
                  {securityMode ? (
                    <span>
                      <strong>Protected Mode Active.</strong> When users click &quot;Find the Disease&quot;, they are taken to the <strong>User Login</strong> screen. Only registered users with valid credentials can access.
                    </span>
                  ) : (
                    <span>
                      <strong>Open Public Mode.</strong> Anyone can click &quot;Find the Disease&quot; and receive diagnosis without logging in.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-[#1E7743] border-b border-gray-100 pb-3">
                <KeyRound className="w-5 h-5 text-[#1E7743]" />
                <h3 className="text-base font-bold text-gray-900">Change Admin Login Password</h3>
              </div>
              <form onSubmit={handleChangeAdminPassword} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  required
                  value={currentAdminPassword}
                  onChange={(e) => setCurrentAdminPassword(e.target.value)}
                  placeholder="Current password"
                  className="flex-1 p-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="password"
                  minLength={6}
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Enter a new password"
                  className="flex-1 p-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button type="submit" className="px-5 py-2.5 bg-[#146C3D] hover:bg-[#0E522C] text-white font-bold rounded-xl cursor-pointer shadow-xs">
                  Change Password
                </button>
              </form>
            </div>

            {/* Contact Admin Screen Settings (For Picture 1 & 2 "Forget login code" screen) */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h3 className="text-base font-bold text-gray-900">&quot;Forget Login Code&quot; Screen Settings</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Configure the contact email, hotline number, description, and display style shown to users when they click &quot;Forget login code&quot;.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveContactAdminSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Admin Contact Email</label>
                  <input
                    type="email"
                    required
                    value={contactAdminSettings.email}
                    onChange={(e) => setContactAdminSettings({ ...contactAdminSettings, email: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="315222057@hamdarduniversity.edu.bd"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Admin Contact Phone / Hotline</label>
                  <input
                    type="tel"
                    required
                    value={contactAdminSettings.phone}
                    onChange={(e) => setContactAdminSettings({ ...contactAdminSettings, phone: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-medium font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="+880123456789"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Description / Instructions Message</label>
                  <textarea
                    rows={2}
                    value={contactAdminSettings.description}
                    onChange={(e) => setContactAdminSettings({ ...contactAdminSettings, description: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Forget anything send us email with mention your User ID"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">Display Style</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setContactAdminSettings({ ...contactAdminSettings, displayStyle: "card_green" })}
                      className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                        contactAdminSettings.displayStyle === "card_green"
                          ? "border-emerald-600 bg-emerald-50/50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="displayStyle"
                        checked={contactAdminSettings.displayStyle === "card_green"}
                        onChange={() => setContactAdminSettings({ ...contactAdminSettings, displayStyle: "card_green" })}
                        className="text-emerald-600"
                      />
                      <div>
                        <p className="font-bold text-gray-900">Solid Green Box (Picture 1)</p>
                        <p className="text-[11px] text-gray-500">Dark green card highlighting admin email</p>
                      </div>
                    </label>

                    <label
                      onClick={() => setContactAdminSettings({ ...contactAdminSettings, displayStyle: "card_dual" })}
                      className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                        contactAdminSettings.displayStyle === "card_dual"
                          ? "border-emerald-600 bg-emerald-50/50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="displayStyle"
                        checked={contactAdminSettings.displayStyle === "card_dual"}
                        onChange={() => setContactAdminSettings({ ...contactAdminSettings, displayStyle: "card_dual" })}
                        className="text-emerald-600"
                      />
                      <div>
                        <p className="font-bold text-gray-900">Dual Email &amp; Phone (Picture 2)</p>
                        <p className="text-[11px] text-gray-500">Separated email and phone cards</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Live User Preview
                  </span>
                  {contactAdminSettings.displayStyle === "card_green" ? (
                    <div className="p-4 bg-[#146C3D] text-white rounded-2xl shadow-xs">
                      <p className="text-xs text-white/90 font-medium mb-1">{contactAdminSettings.description}</p>
                      <p className="text-sm font-bold font-mono tracking-wide">{contactAdminSettings.email}</p>
                      <p className="text-xs text-white/80 font-mono mt-0.5">Hotline: {contactAdminSettings.phone}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-3 bg-white border border-gray-200 rounded-xl">
                        <span className="text-[10px] font-bold text-gray-400 block">Email Address</span>
                        <span className="font-bold text-gray-800 text-xs font-mono">{contactAdminSettings.email}</span>
                      </div>
                      <div className="p-3 bg-white border border-gray-200 rounded-xl">
                        <span className="text-[10px] font-bold text-gray-400 block">Contact Phone</span>
                        <span className="font-bold text-gray-800 text-xs font-mono">{contactAdminSettings.phone}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#146C3D] hover:bg-[#0E522C] text-white font-bold rounded-xl cursor-pointer shadow-xs"
                  >
                    Save Contact Information
                  </button>
                </div>
              </form>
            </div>

            {/* Brand Logo Management Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Brand Logo Management</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Update or remove the logo used across the Navigation Bar, Hero Section, Call To Action, and Footer.
                  </p>
                </div>
                {currentLogo && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Custom Logo Active
                  </span>
                )}
              </div>

              {/* Current Active Logo Previews */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Active Logo Preview (Live Across App)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* On Dark Green Background */}
                  <div className="p-4 rounded-xl bg-[#1B5E20] border border-emerald-800 flex flex-col items-center justify-center gap-2">
                    <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">
                      Dark Background (Navbar/Hero/CTA)
                    </span>
                    <Logo size="md" lightMode={false} />
                  </div>
                  {/* On Light Background */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      Light Background
                    </span>
                    <Logo size="md" lightMode={true} />
                  </div>
                </div>
              </div>

              {/* Logo Upload & Input Controls */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    1. Upload Logo from Computer / Device
                  </label>
                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-emerald-50/30 transition-all">
                    <Upload className="w-6 h-6 text-emerald-600 mb-1.5" />
                    <span className="text-xs font-bold text-gray-700">Click to choose image file</span>
                    <span className="text-[11px] text-gray-500 mt-0.5">PNG, JPG, SVG, WEBP (Recommended square or transparent)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    2. Or Paste Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={logoInputUrl}
                    onChange={(e) => setLogoInputUrl(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Staged Preview if selected */}
                {logoInputUrl && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={logoInputUrl}
                        alt="Staged Preview"
                        className="w-10 h-10 object-contain rounded-lg border bg-white p-1"
                      />
                      <div>
                        <p className="text-xs font-bold text-amber-900">New Logo Ready to Apply</p>
                        <p className="text-[11px] text-amber-700">Click &quot;Save &amp; Apply Logo&quot; to update across all pages.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLogoInputUrl("")}
                      className="text-xs font-bold text-amber-900 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={!logoInputUrl}
                    onClick={() => handleSaveLogo()}
                    className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                      logoInputUrl
                        ? "bg-[#1E7743] hover:bg-[#155D33] text-white active:scale-98"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Apply Logo Globally</span>
                  </button>

                  {currentLogo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Remove Logo (Reset to Default)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Supported Crops Management</h3>
                <p className="text-xs text-gray-500 mt-1">Add or remove crops shown on the public home page.</p>
              </div>
              <form onSubmit={handleCreateSupportedCrop} className="grid gap-3 sm:grid-cols-2">
                <input required value={newSupportedCrop.name} onChange={(e) => setNewSupportedCrop({ ...newSupportedCrop, name: e.target.value })} placeholder="Crop name in English" className="p-2.5 border border-gray-200 rounded-xl text-xs" />
                <input required value={newSupportedCrop.nameBn} onChange={(e) => setNewSupportedCrop({ ...newSupportedCrop, nameBn: e.target.value })} placeholder="Crop name in Bangla" className="p-2.5 border border-gray-200 rounded-xl text-xs" />
                <input type="url" value={newSupportedCrop.imageUrl} onChange={(e) => setNewSupportedCrop({ ...newSupportedCrop, imageUrl: e.target.value })} placeholder="Image URL (optional)" className="p-2.5 border border-gray-200 rounded-xl text-xs" />
                <label className="flex cursor-pointer items-center rounded-xl border border-dashed border-gray-300 p-2.5 text-xs font-bold text-gray-600"><Upload className="mr-2 h-4 w-4" /> Upload crop image<input type="file" accept="image/*" onChange={handleSupportedCropImage} className="hidden" /></label>
                <button type="submit" className="sm:col-span-2 rounded-xl bg-[#146C3D] px-5 py-2.5 text-xs font-bold text-white">Add Supported Crop</button>
              </form>
              <div className="grid gap-2 sm:grid-cols-2">
                {supportedCrops.map((crop) => (
                  <div key={crop.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3">
                    <div className="flex items-center gap-2 min-w-0">{crop.imageUrl ? <img src={crop.imageUrl} alt="" className="h-9 w-9 rounded-lg object-cover" /> : null}<span className="truncate text-xs font-bold">{crop.name} ({crop.nameBn})</span></div>
                    <button type="button" onClick={() => handleDeleteSupportedCrop(crop.id)} className="text-xs font-bold text-rose-600">Remove</button>
                  </div>
                ))}
              </div>
            </div>

            {/* System Configuration Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900">System Configuration</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">AI Pathology Engine</label>
                  <input
                    type="text"
                    disabled
                    value="Gemini Multimodal Diagnostic Network"
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Record Full Details Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedRecord.imageUrl}
                alt={selectedRecord.crop}
                className="w-16 h-16 rounded-xl object-cover border"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedRecord.disease}</h3>
                <p className="text-xs text-emerald-700 font-bold">{selectedRecord.crop} ({selectedRecord.cropBn}) • {selectedRecord.date}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div>
                <span className="font-bold text-[#146C3D]">Symptoms: </span>
                <p>{selectedRecord.symptoms}</p>
              </div>
              <div>
                <span className="font-bold text-[#146C3D]">Causes: </span>
                <p>{selectedRecord.causes}</p>
              </div>
              <div>
                <span className="font-bold text-[#146C3D]">Treatment: </span>
                <p>{selectedRecord.treatment}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <span className="font-bold text-emerald-900 block mb-1">Recommended Bangladeshi Medicines:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-emerald-950 font-semibold">
                  {selectedRecord.bangladeshMedicines.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Disease Modal */}
      {showAddDisease && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-4">Add Crop Disease</h3>
            <form onSubmit={handleCreateDisease} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Disease Name (English)</label>
                <input
                  type="text"
                  required
                  value={newDisease.name}
                  onChange={(e) => setNewDisease({ ...newDisease, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Disease Name (Bangla)</label>
                <input
                  type="text"
                  required
                  value={newDisease.nameBn}
                  onChange={(e) => setNewDisease({ ...newDisease, nameBn: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Crop</label>
                <input
                  type="text"
                  required
                  value={newDisease.crop}
                  onChange={(e) => setNewDisease({ ...newDisease, crop: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Pathogen / Cause</label>
                <input
                  type="text"
                  required
                  value={newDisease.pathogen}
                  onChange={(e) => setNewDisease({ ...newDisease, pathogen: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Common Medicines (comma separated)</label>
                <input
                  type="text"
                  required
                  value={newDisease.commonMedicines}
                  onChange={(e) => setNewDisease({ ...newDisease, commonMedicines: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDisease(false)}
                  className="px-3 py-1.5 border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#146C3D] text-white font-bold rounded-lg"
                >
                  Save Disease
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddMed && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-4">Add Bangladeshi Medicine</h3>
            <form onSubmit={handleCreateMedicine} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Score 250 EC"
                  value={newMed.brandName}
                  onChange={(e) => setNewMed({ ...newMed, brandName: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Generic / Chemical Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Difenoconazole 250 g/L"
                  value={newMed.genericName}
                  onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={newMed.company}
                  onChange={(e) => setNewMed({ ...newMed, company: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Dosage</label>
                <input
                  type="text"
                  required
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMed(false)}
                  className="px-3 py-1.5 border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#146C3D] text-white font-bold rounded-lg"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
