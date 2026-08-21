/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Language } from "./types";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { SupportedCrops } from "./components/SupportedCrops";
import { CallToAction } from "./components/CallToAction";
import { Footer } from "./components/Footer";
import { DiseaseDetector } from "./components/DiseaseDetector";
import { FindNearby } from "./components/FindNearby";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserLoginView } from "./components/UserLoginView";
import { ContactEDModal } from "./components/ContactEDModal";
import { ContactAdminInfo } from "./types";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeView, setActiveView] = useState<"landing" | "detector" | "admin" | "nearby" | "userLogin">(() => {
    const savedView = localStorage.getItem("easydiseay_active_view");
    return savedView === "admin" || savedView === "detector" || savedView === "nearby" || savedView === "userLogin" ? savedView : "landing";
  });
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem("easydiseay_admin_token"));
  const [selectedCropHint, setSelectedCropHint] = useState<string>("");
  const [securityMode, setSecurityMode] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<{ userId: string; fullName: string; role?: string } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactAdmin, setContactAdmin] = useState<ContactAdminInfo>({
    email: "315222057@hamdarduniversity.edu.bd",
    phone: "+880123456789",
    description: "Contact EasyDiseay administration.",
    displayStyle: "card_green",
  });

  // Sync custom logo, security mode, user session, and track page view on boot
  useEffect(() => {
    localStorage.setItem("easydiseay_active_view", activeView);
  }, [activeView]);

  useEffect(() => {
    // Track page view event
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "page_view", path: window.location.pathname }),
    }).catch(() => {});

    // The backend/database is the source of truth. Browser storage is not used
    // to authorize users or determine global application settings.
    const fetchAppSettings = () => {
      fetch("/api/settings", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return;
          if (data.customLogo !== undefined) {
            if (data.customLogo) localStorage.setItem("easydiseay_custom_logo", data.customLogo);
            else localStorage.removeItem("easydiseay_custom_logo");
            window.dispatchEvent(new Event("easydiseay_logo_changed"));
          }
          if (data.loginRequired !== undefined) setSecurityMode(Boolean(data.loginRequired));
          if (data.contactAdmin) setContactAdmin(data.contactAdmin);
        })
        .catch(() => {});
    };

    fetchAppSettings();

    fetch("/api/user/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUserSession(data.user);
          localStorage.setItem("easydiseay_user_session", JSON.stringify(data.user));
        } else {
          setUserSession(null);
          localStorage.removeItem("easydiseay_user_session");
        }
      })
      .catch(() => {
        setUserSession(null);
        localStorage.removeItem("easydiseay_user_session");
      });

    if (adminToken) {
      fetch("/api/admin/me", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data?.authenticated) {
            localStorage.removeItem("easydiseay_admin_token");
            setAdminToken(null);
            if (activeView === "admin") setActiveView("landing");
          }
        })
        .catch(() => {
          localStorage.removeItem("easydiseay_admin_token");
          setAdminToken(null);
          if (activeView === "admin") setActiveView("landing");
        });
    } else if (activeView === "admin") {
      setActiveView("landing");
    }

    const handleSecurityChange = () => {
      fetchAppSettings();
    };

    window.addEventListener("easydiseay_security_mode_changed", handleSecurityChange);
    return () => {
      window.removeEventListener("easydiseay_security_mode_changed", handleSecurityChange);
    };
  }, []);

  const handleOpenDetector = (cropHint: string = "") => {
    setSelectedCropHint(cropHint);

    // If Security Mode is ON and user is NOT logged in -> go to User Login View
    if (securityMode && !userSession) {
      setActiveView("userLogin");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Otherwise directly open Disease Detector
    setActiveView("detector");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUserLoginSuccess = (userData: { userId: string; fullName: string; role?: string }) => {
    setUserSession(userData);
    setActiveView("detector");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUserLogout = () => {
    fetch("/api/user/logout", { method: "POST" }).catch(() => {});
    setUserSession(null);
    localStorage.removeItem("easydiseay_user_session");
    setActiveView("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem("easydiseay_admin_token", token);
    setActiveView("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAdminToken(null);
    localStorage.removeItem("easydiseay_admin_token");
    setActiveView("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If in Admin View and authenticated
  if (activeView === "admin" && adminToken) {
    return (
      <AdminDashboard
        language={language}
        onLogout={handleLogout}
      />
    );
  }

  // If in User Login View (Security Mode)
  if (activeView === "userLogin") {
    return (
      <UserLoginView
        language={language}
        onLoginSuccess={handleUserLoginSuccess}
        onBackToHome={() => {
          setActiveView("landing");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  // If in Detector View matching screenshot
  if (activeView === "detector") {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBFDFB] text-[#1B3022] font-sans">
        <DiseaseDetector
          language={language}
          onLanguageChange={(lang) => setLanguage(lang)}
          onBack={() => {
            setActiveView("landing");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          initialCrop={selectedCropHint}
          userSession={userSession}
          onUserLogout={handleUserLogout}
        />
        <Footer
          language={language}
          onOpenAdmin={() => setAdminModalOpen(true)}
          onOpenContact={() => setContactOpen(true)}
        />
        <AdminLoginModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          language={language}
          onLoginSuccess={handleLoginSuccess}
        />
        {contactOpen && <ContactEDModal language={language} contact={contactAdmin} onClose={() => setContactOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBF9] text-[#1B3022] font-sans selection:bg-[#FFD54F] selection:text-[#1B5E20]">
      {/* Top Sticky Navigation Bar */}
      <Navbar
        language={language}
        onLanguageChange={(lang) => setLanguage(lang)}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === "landing" && (
          <>
            {/* 1. Green Hero Section */}
            <Hero
              language={language}
              onFindDiseaseClick={() => handleOpenDetector("")}
              onFindNearbyClick={() => {
                setActiveView("nearby");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenAdmin={() => setAdminModalOpen(true)}
            />

            {/* 2. How It Works Section */}
            <HowItWorks language={language} />

            {/* 3. Supported Crops Section */}
            <SupportedCrops
              language={language}
              onSelectCrop={(crop) => handleOpenDetector(crop)}
            />

            {/* 4. Ready to Save Your Crop CTA */}
            <CallToAction
              language={language}
              onFindDiseaseClick={() => handleOpenDetector("")}
              onFindNearbyClick={() => {
                setActiveView("nearby");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}

        {activeView === "nearby" && (
          <FindNearby
            language={language}
            onBackToHome={() => {
              setActiveView("landing");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        language={language}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Admin Login Dialog */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        language={language}
        onLoginSuccess={handleLoginSuccess}
      />
      {contactOpen && <ContactEDModal language={language} contact={contactAdmin} onClose={() => setContactOpen(false)} />}
    </div>
  );
}
