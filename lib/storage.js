import fs from "fs";
import path from "path";

const DIR = process.env.DATA_DIR || "/tmp/jadibotdata";

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function file(name) {
  ensureDir(DIR);
  return path.join(DIR, `${name}.json`);
}

export function readJSON(name, fallback = {}) {
  try {
    const f = file(name);
    if (!fs.existsSync(f)) return fallback;
    return JSON.parse(fs.readFileSync(f, "utf-8"));
  } catch { return fallback; }
}

export function writeJSON(name, data) {
  fs.writeFileSync(file(name), JSON.stringify(data, null, 2));
}

// ── Users log ────────────────────────────────────────────
export function logUser(user) {
  const users = readJSON("users", {});
  users[user.email] = {
    email:     user.email,
    name:      user.name,
    image:     user.image,
    lastLogin: new Date().toISOString(),
    loginCount: (users[user.email]?.loginCount || 0) + 1,
  };
  writeJSON("users", users);
}

export function getUsers() {
  return Object.values(readJSON("users", {}));
}

// ── Maintenance ───────────────────────────────────────────
export function getMaintenance() {
  return readJSON("maintenance", { active: false, message: "Sedang dalam pemeliharaan. Mohon tunggu sebentar." });
}

export function setMaintenance(data) {
  writeJSON("maintenance", data);
}

// ── Firewall (blocked IPs/emails) ────────────────────────
export function getFirewall() {
  return readJSON("firewall", { blockedEmails: [], blockedIPs: [], enabled: true });
}

export function setFirewall(data) {
  writeJSON("firewall", data);
}

export function isBlocked(email, ip) {
  const fw = getFirewall();
  if (!fw.enabled) return false;
  if (fw.blockedEmails.includes(email?.toLowerCase())) return true;
  if (fw.blockedIPs.includes(ip)) return true;
  return false;
}
