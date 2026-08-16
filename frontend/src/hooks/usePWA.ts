import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export interface PWAState {
  canInstall: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
  promptInstall: () => Promise<void>;
  applyUpdate: () => void;
}

const DISMISS_KEY = "hirelens_pwa_install_dismissed";

export function usePWA(): PWAState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsInstalled(mq.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const handleMQChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener("change", handleMQChange);
    return () => mq.removeEventListener("change", handleMQChange);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      if (!localStorage.getItem(DISMISS_KEY)) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const handler = () => { setIsInstalled(true); setDeferredPrompt(null); };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const trackUpdate = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) { setWaitingSW(reg.waiting); setUpdateAvailable(true); return; }
      reg.addEventListener("updatefound", () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener("statechange", () => {
          if (newSW.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingSW(newSW); setUpdateAvailable(true);
          }
        });
      });
    };
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        trackUpdate(reg);
        const interval = setInterval(() => reg.update(), 60_000);
        return () => clearInterval(interval);
      })
      .catch((err) => console.warn("[PWA] SW registration failed:", err));

    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!reloading) { reloading = true; window.location.reload(); }
    });
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "dismissed") localStorage.setItem(DISMISS_KEY, "1");
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const applyUpdate = useCallback(() => {
    if (!waitingSW) return;
    waitingSW.postMessage({ type: "SKIP_WAITING" });
    setUpdateAvailable(false); setWaitingSW(null);
  }, [waitingSW]);

  return { canInstall: !!deferredPrompt && !isInstalled, isInstalled, updateAvailable, promptInstall, applyUpdate };
}
