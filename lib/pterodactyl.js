const BASE    = process.env.PTERODACTYL_URL?.replace(/\/$/, "");
const APP_KEY = process.env.PTERODACTYL_API_KEY;
const CLI_KEY = process.env.PTERODACTYL_CLIENT_KEY;

function appHeaders() {
  return { "Accept":"application/json","Content-Type":"application/json","Authorization":`Bearer ${APP_KEY}` };
}
function cliHeaders() {
  return { "Accept":"application/json","Content-Type":"application/json","Authorization":`Bearer ${CLI_KEY}` };
}

async function appReq(method, path, body) {
  const r = await fetch(`${BASE}/api/application${path}`, {
    method, headers: appHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`[APP] ${method} ${path} → ${r.status}: ${await r.text()}`);
  if (r.status === 204) return null;
  return r.json();
}

async function cliReq(method, path, body) {
  const r = await fetch(`${BASE}/api/client${path}`, {
    method, headers: cliHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`[CLI] ${method} ${path} → ${r.status}: ${await r.text()}`);
  if (r.status === 204) return null;
  return r.json();
}

/** Ambil semua server yang namanya mengandung "JadiBotList" */
export async function getJadiBotListServers() {
  const data = await appReq("GET", "/servers?per_page=100");
  const all  = data.data || [];
  // Filter server yang namanya mengandung JadiBotList (case insensitive)
  return all
    .filter((s) => s.attributes.name.toLowerCase().includes("jadibotlist"))
    .map(normalize);
}

/** Semua server milik user tertentu */
export async function getServersByOwner(email) {
  const data = await appReq("GET", "/servers?per_page=100&include=user");
  const all  = data.data || [];
  return all
    .filter((s) => s.attributes?.relationships?.user?.attributes?.email === email)
    .map(normalize);
}

/** List ALL servers - admin view */
export async function listAllServers() {
  const data = await appReq("GET", "/servers?per_page=100");
  return (data.data || []).map(normalize);
}

/** Get single server by numeric ID */
export async function getServer(id) {
  const data = await appReq("GET", `/servers/${id}`);
  return normalize(data);
}

/** Create server */
export async function createServer({ name, userId, egg, nestId, dockerImage, startup, envVars, cpu=100, memory=512, disk=1024, locationId=1 }) {
  const data = await appReq("POST", "/servers", {
    name, user: userId, egg,
    docker_image: dockerImage, startup,
    environment: envVars,
    limits: { memory, swap:0, disk, io:500, cpu },
    feature_limits: { databases:0, allocations:1, backups:0 },
    deploy: { locations:[locationId], dedicated_ip:false, port_range:[] },
  });
  return normalize(data);
}

/** Delete server */
export async function deleteServer(id) {
  await appReq("DELETE", `/servers/${id}`);
}

/** Suspend */
export async function suspendServer(id) {
  await appReq("POST", `/servers/${id}/suspend`);
}

/** Unsuspend */
export async function unsuspendServer(id) {
  await appReq("POST", `/servers/${id}/unsuspend`);
}

/** Power signal via Client API */
export async function sendPower(identifier, signal) {
  await cliReq("POST", `/servers/${identifier}/power`, { signal });
}

/** Resource usage */
export async function getResources(identifier) {
  return cliReq("GET", `/servers/${identifier}/resources`);
}

/** Users */
export async function getUserByEmail(email) {
  const data = await appReq("GET", `/users?filter[email]=${encodeURIComponent(email)}`);
  return data.data?.[0] || null;
}

export async function createUser({ email, username, firstName, lastName }) {
  const data = await appReq("POST", "/users", {
    email, username, first_name:firstName, last_name:lastName,
    password: Math.random().toString(36).slice(2) + "Aa1!",
  });
  return data.attributes;
}

/** Nests & Eggs */
export async function listNests() {
  const data = await appReq("GET", "/nests");
  return data.data || [];
}

export async function listEggs(nestId) {
  const data = await appReq("GET", `/nests/${nestId}/eggs?include=variables`);
  return data.data || [];
}

/** Normalize server shape */
function normalize(raw) {
  const a = raw.attributes;
  return {
    id:         a.id,
    uuid:       a.uuid,
    identifier: a.identifier,
    name:       a.name,
    status:     a.status,
    suspended:  a.suspended,
    limits:     a.limits,
    egg:        a.egg,
    nest:       a.nest,
    node:       a.node,
    createdAt:  a.created_at,
    meta:       parseMeta(a.description),
  };
}

export function encodeMeta(obj) { return JSON.stringify(obj); }
function parseMeta(d) { try { return JSON.parse(d); } catch { return {}; } }

export async function patchDescription(serverId, description) {
  await fetch(`${BASE}/api/application/servers/${serverId}/details`, {
    method:"PATCH", headers:appHeaders(),
    body:JSON.stringify({ description }),
  });
}
