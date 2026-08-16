import { useState } from "react";
import type { PWAState } from "../hooks/usePWA";

// ─── Install Banner ────────────────────────────────────────────────────────────
export function PWAInstallBanner({ pwa }: { pwa: PWAState }) {
  const [dismissed, setDismissed] = useState(false);

  if (!pwa.canInstall || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem("hirelens_pwa_install_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "env(safe-area-inset-bottom, 0px)",
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 20px",
        background: "#1d1816",
        boxShadow: "0 -2px 16px rgba(29,24,22,0.18)",
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "Source Serif 4, Georgia, serif", fontSize: 14, fontWeight: 600, color: "#ffffff", letterSpacing: "-0.005em" }}>
          Install HireLens
        </p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
          Add to your home screen for the best experience
        </p>
      </div>
      <button
        onClick={() => pwa.promptInstall()}
        style={{
          background: "#cc5a37",
          color: "#ffffff",
          border: "none",
          borderRadius: 6,
          padding: "9px 16px",
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
      </button>
    </div>
  );
}

// ─── Update Toast ──────────────────────────────────────────────────────────────
export function PWAUpdateToast({ pwa }: { pwa: PWAState }) {
  if (!pwa.updateAvailable) return null;
  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: "max(16px, env(safe-area-inset-top))",
        right: 16,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#1d1816",
        color: "#ffffff",
        padding: "12px 16px",
        borderRadius: 8,
        boxShadow: "0 4px 20px rgba(29,24,22,0.25)",
        maxWidth: 320,
        animation: "fadeUp 0.2s ease-out both",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#cc5a37", flexShrink: 0 }}>
        system_update
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600 }}>Update available</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
          A new version of HireLens is ready
        </p>
      </div>
      <button
        onClick={pwa.applyUpdate}
        style={{
          background: "#cc5a37",
          color: "#ffffff",
          border: "none",
          borderRadius: 5,
          padding: "6px 12px",
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Reload
      </button>
    </div>
  );
}
