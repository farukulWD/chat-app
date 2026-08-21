import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS masks the home-screen icon to a rounded square and paints no backdrop, so
 * unlike icon.svg this one sits on a filled tile with the mark knocked out in
 * white. Generated at build time — no binary checked in.
 */
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="180" height="180">
  <rect width="32" height="32" fill="#1b5fb8"/>
  <mask id="n">
    <rect width="32" height="32" fill="#fff"/>
    <circle cx="24.5" cy="24" r="6" fill="#000"/>
  </mask>
  <g mask="url(#n)" fill="#ffffff" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round">
    <rect x="3" y="4" width="24" height="19" rx="6.5" stroke="none"/>
    <path d="M9 19 L6.8 27.2 L15.5 21.5 Z"/>
  </g>
  <circle cx="24.5" cy="24" r="3.9" fill="#54c57a"/>
</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <img
        width={180}
        height={180}
        src={`data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`}
        alt=""
      />
    ),
    size,
  );
}
