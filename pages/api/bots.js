import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import {
  listAllServers, getServer, createServer, deleteServer,
  suspendServer, unsuspendServer, sendPower,
  getUserByEmail, createUser, encodeMeta, patchDescription,
} from "../../lib/pterodactyl";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  // ── GET ──────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const all = await listAllServers();
      // Ambil semua server yang meta.owner === email user ATAU
      // yang namanya mengandung "JadiBotList" (admin shared bots)
      const mine = all.filter((s) =>
        s.meta?.owner === session.user.email ||
        s.name.toLowerCase().includes("jadibotlist")
      );
      return res.status(200).json(mine.map(fmt));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST ─────────────────────────────────────────────────
  if (req.method === "POST") {
    const { name, phone, folder } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "name dan phone wajib" });
    try {
      let ptUser = await getUserByEmail(session.user.email);
      if (!ptUser) {
        const parts = session.user.name?.split(" ") || ["User","Bot"];
        ptUser = await createUser({
          email: session.user.email,
          username: session.user.email.split("@")[0].replace(/[^a-z0-9]/gi,"_"),
          firstName: parts[0], lastName: parts.slice(1).join(" ") || "User",
        });
      }
      const uid = ptUser.attributes?.id ?? ptUser.id;
      const server = await createServer({
        name,
        userId: uid,
        egg:        parseInt(process.env.PTERO_EGG_ID    || "1"),
        nestId:     parseInt(process.env.PTERO_NEST_ID   || "1"),
        dockerImage: process.env.PTERO_DOCKER_IMAGE || "ghcr.io/pterodactyl/yolks:nodejs_18",
        startup:     process.env.PTERO_STARTUP      || "node index.js",
        envVars: { PHONE_NUMBER: phone },
        cpu:        parseInt(process.env.PTERO_CPU      || "100"),
        memory:     parseInt(process.env.PTERO_MEMORY   || "512"),
        disk:       parseInt(process.env.PTERO_DISK     || "1024"),
        locationId: parseInt(process.env.PTERO_LOCATION || "1"),
      });
      const meta = { owner: session.user.email, phone, folder: folder || "WhatsApp" };
      await patchDescription(server.id, encodeMeta(meta));
      return res.status(201).json(fmt({ ...server, meta }));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── PATCH ────────────────────────────────────────────────
  if (req.method === "PATCH") {
    const { id, action } = req.body;
    if (!id) return res.status(400).json({ error: "id wajib" });
    try {
      const server = await getServer(id);
      if (action === "suspend")   await suspendServer(id);
      if (action === "unsuspend") await unsuspendServer(id);
      if (["start","stop","restart","kill"].includes(action))
        await sendPower(server.identifier, action);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── DELETE ───────────────────────────────────────────────
  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id wajib" });
    try {
      await deleteServer(id);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}

function fmt(s) {
  return {
    id:         s.id,
    uuid:       s.uuid,
    identifier: s.identifier,
    name:       s.name,
    phone:      s.meta?.phone  || "—",
    folder:     s.meta?.folder || "Default",
    suspended:  s.suspended,
    status:     s.status,
    limits:     s.limits,
    createdAt:  s.createdAt,
  };
}
