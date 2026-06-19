import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/metadata";

export const alt = `${SITE_NAME} — Investment, Referral & SIP Platform`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          Fin<span style={{ color: "#10b981" }}>mora</span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "rgba(255,255,255,0.75)",
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          Investment · Referral · SIP Platform
        </div>
      </div>
    ),
    { ...size }
  );
}
