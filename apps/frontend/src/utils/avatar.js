/**
 * NEXORA Universal Resilient Avatar & Image Utilities
 * Guarantees 100% offline, zero-network, instantaneous avatar rendering.
 * Prevents broken images when external avatar services (e.g. ui-avatars.com) fail or are blocked.
 */

const PALETTES = [
  { from: "#3b82f6", to: "#1d4ed8" }, // Blue
  { from: "#8b5cf6", to: "#6d28d9" }, // Purple
  { from: "#ec4899", to: "#be185d" }, // Pink
  { from: "#10b981", to: "#047857" }, // Emerald
  { from: "#f59e0b", to: "#d97706" }, // Amber
  { from: "#06b6d4", to: "#0e7490" }, // Cyan
  { from: "#6366f1", to: "#4338ca" }, // Indigo
];

function getPaletteForName(name = "User") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

export function generateSvgAvatar(name = "User", size = 128) {
  const cleanName = (typeof name === "string" && name.trim()) ? name.trim() : "User";
  const initials = cleanName
    .split(/\s+/)
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || cleanName.slice(0, 2).toUpperCase() || "U";

  const palette = getPaletteForName(cleanName);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.from}" />
        <stop offset="100%" stop-color="${palette.to}" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${Math.floor(size / 2)}" fill="url(#grad)" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="${Math.floor(size * 0.42)}px" letter-spacing="1">
      ${initials}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getAvatarUrl(name = "User", avatarUrl = null) {
  if (
    avatarUrl &&
    typeof avatarUrl === "string" &&
    avatarUrl.trim() !== "" &&
    !avatarUrl.includes("ui-avatars.com")
  ) {
    return avatarUrl;
  }
  return generateSvgAvatar(name);
}

export function handleImageError(e, name = "User") {
  if (!e || !e.target) return;
  e.target.onerror = null; // Prevent recursion
  e.target.src = generateSvgAvatar(name);
}

export function getCompanyLogoUrl(companyName = "Company", logoUrl = null) {
  if (
    logoUrl &&
    typeof logoUrl === "string" &&
    logoUrl.trim() !== "" &&
    !logoUrl.includes("ui-avatars.com")
  ) {
    return logoUrl;
  }
  return generateSvgAvatar(companyName);
}

export function handleCompanyLogoError(e, companyName = "Company") {
  if (!e || !e.target) return;
  e.target.onerror = null;
  e.target.src = generateSvgAvatar(companyName);
}
