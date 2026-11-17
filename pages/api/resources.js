import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { getResources } from "../../lib/pterodactyl";
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).end();
  const { identifier } = req.query;
  if (!identifier) return res.status(400).json({ error: "identifier wajib" });
  try {
    const data = await getResources(identifier);
    const r = data.attributes?.resources || {};
    return res.status(200).json({
      running:   data.attributes?.current_state === "running",
      state:     data.attributes?.current_state,
      cpu:       (r.cpu_absolute || 0).toFixed(1),
      memory_mb: Math.round((r.memory_bytes || 0) / 1024 / 1024),
      disk_mb:   Math.round((r.disk_bytes   || 0) / 1024 / 1024),
      rx_kb:     Math.round((r.network_rx_bytes || 0) / 1024),
      tx_kb:     Math.round((r.network_tx_bytes || 0) / 1024),
    });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}
