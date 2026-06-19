const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `FM-${suffix}`;
}
