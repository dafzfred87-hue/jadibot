import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
const store = new Map();
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).end();
  const { phone, action, otp } = req.body;
  if (action === "request") {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    store.set(`${session.user.id}:${phone}`, { code, exp: Date.now() + 5*60*1000 });
    console.log(`[OTP] ${phone} → ${code}`);
    return res.status(200).json({ message: "OTP dikirim" });
  }
  if (action === "verify") {
    const key = `${session.user.id}:${phone}`;
    const rec = store.get(key);
    if (!rec) return res.status(400).json({ error: "OTP tidak ditemukan" });
    if (Date.now() > rec.exp) { store.delete(key); return res.status(400).json({ error: "OTP kadaluarsa" }); }
    if (rec.code !== otp) return res.status(400).json({ error: "OTP salah" });
    store.delete(key);
    return res.status(200).json({ success: true });
  }
  res.status(400).json({ error: "action tidak valid" });
}
