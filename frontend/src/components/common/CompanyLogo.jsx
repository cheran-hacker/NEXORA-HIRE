import React from "react";

// Crisp inline vector SVG logos — zero external HTTP requests, zero network timeouts
export const GoogleLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const MicrosoftLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
    <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
    <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
    <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
  </svg>
);

export const AmazonLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M13.2 13.5c-.8.6-1.7.9-2.7.9-2.1 0-3.5-1.5-3.5-3.6s1.5-3.6 3.6-3.6c.9 0 1.8.3 2.4.9V7.2h1.8v6.2h-1.6v-.6zm-2.4.2c1.2 0 2.3-.8 2.3-2.2 0-1.5-1.1-2.2-2.3-2.2-1.3 0-2.2.8-2.2 2.2s.9 2.2 2.2 2.2z"
      fill="#232F3E"
    />
    <path
      d="M3.5 17.2c4.1 2.4 9.8 2.4 13.9-.2.2-.1.4.1.3.3-.9 1.2-4.9 2.9-10 2.3-1.8-.2-3.2-.9-4.5-2-.2-.2 0-.4.3-.4z"
      fill="#FF9900"
    />
    <path
      d="M18.2 16.4c.3-.3 1.5-.2 1.9.2.1.1 0 .3-.2.3-.8.4-1.8.4-1.9-.2 0-.1 0-.2.2-.3z"
      fill="#FF9900"
    />
  </svg>
);

export const IbmLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="2" rx="0.5" fill="#0F62FE" />
    <rect x="2" y="7" width="20" height="2" rx="0.5" fill="#0F62FE" />
    <rect x="2" y="10" width="20" height="2" rx="0.5" fill="#0F62FE" />
    <rect x="2" y="13" width="20" height="2" rx="0.5" fill="#0F62FE" />
    <rect x="2" y="16" width="20" height="2" rx="0.5" fill="#0F62FE" />
    <rect x="2" y="19" width="20" height="2" rx="0.5" fill="#0F62FE" />
  </svg>
);

export default function CompanyLogo({ company, name, logoUrl, size = 32, className = "" }) {
  const companyName = String(
    name || (typeof company === "object" ? company?.name : company) || ""
  ).trim();
  const lower = companyName.toLowerCase();

  if (lower.includes("google")) {
    return <GoogleLogo size={size} />;
  }
  if (lower.includes("microsoft")) {
    return <MicrosoftLogo size={size} />;
  }
  if (lower.includes("amazon")) {
    return <AmazonLogo size={size} />;
  }
  if (lower.includes("ibm")) {
    return <IbmLogo size={size} />;
  }

  // If a valid custom image URL is provided (not wikimedia)
  if (logoUrl && !logoUrl.includes("wikimedia.org") && !logoUrl.includes("ui-avatars.com")) {
    return (
      <img
        src={logoUrl}
        alt={companyName}
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  // Fast offline monogram fallback
  const initial = companyName ? companyName[0].toUpperCase() : "C";
  const colors = [
    { bg: "rgba(59, 130, 246, 0.15)", text: "#2563eb" },
    { bg: "rgba(16, 185, 129, 0.15)", text: "#059669" },
    { bg: "rgba(168, 85, 247, 0.15)", text: "#9333ea" },
    { bg: "rgba(249, 115, 22, 0.15)", text: "#ea580c" },
  ];
  const color = colors[companyName.length % colors.length];

  return (
    <div
      className={`rounded-3 d-flex align-items-center justify-content-center fw-black ${className}`}
      style={{
        width: size,
        height: size,
        background: color.bg,
        color: color.text,
        fontSize: Math.max(12, Math.floor(size * 0.45)),
        userSelect: "none",
      }}
    >
      {initial}
    </div>
  );
}
