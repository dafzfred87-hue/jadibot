import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { isOwner } from "../../lib/owners";
import { getUsers, getMaintenance, setMaintenance, getFirewall, setFirewall } from "../../lib/storage";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  if (!isOwner(session.user.email)) return res.status(403).json({ error: "Owner only" });

  // GET - fetch all data
  if (req.method === "GET") {
    const { type } = req.query;
    if (type === "users")       return res.status(200).json(getUsers());
    if (type === "maintenance") return res.status(200).json(getMaintenance());
    if (type === "firewall")    return res.status(200).json(getFirewall());
    return res.status(400).json({ error: "type required: users | maintenance | firewall" });
  }

  // POST - update settings
  if (req.method === "POST") {
    const { type, data } = req.body;
    if (type === "maintenance") { setMaintenance(data); return res.status(200).json({ success: true }); }
    if (type === "firewall")    { setFirewall(data);    return res.status(200).json({ success: true }); }
    return res.status(400).json({ error: "type required" });
  }

  res.status(405).end();
}
