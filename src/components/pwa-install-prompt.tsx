"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Share, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/language/language-provider";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // Check if dismissed recently (within 48 hours)
    const dismissedTimestamp = localStorage.getItem("statiq_pwa_dismissed");
    if (dismissedTimestamp) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTimestamp, 10)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 48) {
        return;
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Capture Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // If iOS and not standalone, show prompt after a gentle delay
    if (isIOSDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setInstalledSuccess(true);
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("[PWA] Installation failed:", err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSGuide(false);
    localStorage.setItem("statiq_pwa_dismissed", Date.now().toString());
  };

  if (isStandalone || (!isVisible && !installedSuccess)) return null;

  if (installedSuccess) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-950/90 text-emerald-100 border border-emerald-500/40 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="text-sm font-semibold">
          {t("pwa.installed", "StatIQ AI successfully installed on your device!")}
        </span>
      </div>
    );
  }

  return (
    <>
      {/* PWA Floating Install Banner */}
      <div
        role="dialog"
        aria-label={t("pwa.installPrompt", "Install StatIQ AI Application")}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 w-[92vw] sm:w-[400px] bg-[#111318]/95 dark:bg-[#0c0e12]/95 backdrop-blur-xl border border-white/10 dark:border-white/15 rounded-2xl p-4 shadow-2xl shadow-black/80 transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
      >
        <div className="flex items-start gap-3.5">
          {/* App Icon */}
          <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-surface-container-highest border border-white/10 p-1 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-192x192.png"
              alt="StatIQ AI"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight truncate">
                {t("pwa.installTitle", "Install StatIQ AI")}
              </h4>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                PWA
              </span>
            </div>
            <p className="text-xs text-neutral-300 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
              {t("pwa.installDesc", "Install for ultra-fast load times, offline access, and full screen experience.")}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 mt-3">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-neutral-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                {t("pwa.installBtn", "Install App")}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
              >
                {t("pwa.notNow", "Not now")}
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={t("common.close", "Close")}
            className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#161922] border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                {t("pwa.iosGuideTitle", "Install on iOS / Safari")}
              </h3>
            </div>

            <ol className="space-y-3.5 text-xs text-neutral-300 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] shrink-0">
                  1
                </span>
                <span>
                  {t("pwa.iosStep1", "Tap the ")}
                  <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded">
                    <Share className="w-3 h-3" /> Share
                  </span>
                  {t("pwa.iosStep1Suffix", " button at the bottom of your Safari browser bar.")}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] shrink-0">
                  2
                </span>
                <span>
                  {t("pwa.iosStep2", "Scroll down and select ")}
                  <strong className="text-white">
                    {t("pwa.iosStep2Action", "Add to Home Screen")}
                  </strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] shrink-0">
                  3
                </span>
                <span>
                  {t("pwa.iosStep3", "Tap ")}
                  <strong className="text-white">
                    {t("pwa.iosStep3Action", "Add")}
                  </strong>
                  {t("pwa.iosStep3Suffix", " in the top-right corner to finish installation.")}
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all"
            >
              {t("pwa.gotIt", "Got it")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
