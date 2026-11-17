import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { isOwner } from "../../lib/owners";

export default function AdminFirewall() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [fw, setFw] = useState({ blockedEmails:[], blockedIPs:[], enabled:true });
  const [newEmail, setNewEmail] = useState("");
  const [newIP, setNewIP] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
    if (status === "authenticated" && !isOwner(session?.user?.email)) router.replace("/dashboard");
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && isOwner(session?.user?.email))
      fetch("/api/admin?type=firewall").then(r=>r.json()).then(setFw);
  }, [status, session]);

  async function save(updated) {
    setSaving(true);
    const data = updated || fw;
    await fetch("/api/admin", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ type:"firewall", data }) });
    setSaving(false);
    setToast("Firewall diperbarui"); setTimeout(()=>setToast(""),3000);
  }

  function addEmail() {
    if (!newEmail.trim()) return;
    const updated = { ...fw, blockedEmails: [...fw.blockedEmails, newEmail.toLowerCase().trim()] };
    setFw(updated); setNewEmail(""); save(updated);
  }

  function removeEmail(e) {
    const updated = { ...fw, blockedEmails: fw.blockedEmails.filter(x => x !== e) };
    setFw(updated); save(updated);
  }

  function addIP() {
    if (!newIP.trim()) return;
    const updated = { ...fw, blockedIPs: [...fw.blockedIPs, newIP.trim()] };
    setFw(updated); setNewIP(""); save(updated);
  }

  function removeIP(ip) {
    const updated = { ...fw, blockedIPs: fw.blockedIPs.filter(x => x !== ip) };
    setFw(updated); save(updated);
  }

  return (
    <Layout bots={[]}>
      <div className="page">
        <button className="back" onClick={() => router.push("/dashboard")}>‹ Dashboard</button>
        <div className="ph"><h1>🛡️ Firewall</h1><p>Blokir email atau IP dari mengakses Jadibot</p></div>

        {/* Toggle */}
        <div className="card mb">
          <div className="row">
            <div><div className="rl">Firewall Status</div><div className="rs">{fw.enabled ? "🛡️ Aktif" : "⚠️ Nonaktif"}</div></div>
            <label className="tog">
              <input type="checkbox" checked={fw.enabled} onChange={e => { const u={...fw,enabled:e.target.checked}; setFw(u); save(u); }} />
              <div className="ttrack" />
            </label>
          </div>
        </div>

        {/* Block email */}
        <div className="card mb">
          <div className="ctitle">🚫 Email Diblokir ({fw.blockedEmails.length})</div>
          <div className="add-row">
            <input className="fi" placeholder="email@gmail.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addEmail()} />
            <button className="btn-add" onClick={addEmail}>Blokir</button>
          </div>
          {fw.blockedEmails.length === 0 ? <div className="empty-list">Tidak ada email yang diblokir</div> : (
            <div className="list">
              {fw.blockedEmails.map(e => (
                <div key={e} className="list-item">
                  <span className="mono">{e}</span>
                  <button className="rm" onClick={() => removeEmail(e)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Block IP */}
        <div className="card">
          <div className="ctitle">🌐 IP Diblokir ({fw.blockedIPs.length})</div>
          <div className="add-row">
            <input className="fi" placeholder="192.168.1.1" value={newIP} onChange={e=>setNewIP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addIP()} />
            <button className="btn-add" onClick={addIP}>Blokir</button>
          </div>
          {fw.blockedIPs.length === 0 ? <div className="empty-list">Tidak ada IP yang diblokir</div> : (
            <div className="list">
              {fw.blockedIPs.map(ip => (
                <div key={ip} className="list-item">
                  <span className="mono">{ip}</span>
                  <button className="rm" onClick={() => removeIP(ip)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {toast && <div className="toast">✓ {toast}</div>}
      <style jsx>{`
        .page{padding:2rem;max-width:520px}
        .back{display:flex;align-items:center;gap:6px;font-size:13px;color:#555;background:none;border:none;cursor:pointer;padding:0;margin-bottom:1.5rem;transition:color .15s}
        .back:hover{color:#fff}
        .ph{margin-bottom:1.75rem}
        .ph h1{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:4px}
        .ph p{font-size:13px;color:#555}
        .card{background:#0e0e0e;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:1.5rem}
        .mb{margin-bottom:12px}
        .row{display:flex;align-items:center;justify-content:space-between}
        .rl{font-size:14px;font-weight:500;color:#fff;margin-bottom:4px}
        .rs{font-size:12px;color:#555}
        .tog{position:relative;display:inline-block;width:44px;height:24px}
        .tog input{opacity:0;width:0;height:0}
        .ttrack{position:absolute;inset:0;border-radius:24px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:.2s}
        .tog input:checked+.ttrack{background:#22c55e;border-color:#22c55e}
        .ttrack::after{content:'';position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:.2s}
        .tog input:checked+.ttrack::after{transform:translateX(20px)}
        .ctitle{font-size:13px;font-weight:500;color:#ccc;margin-bottom:1rem}
        .add-row{display:flex;gap:8px;margin-bottom:12px}
        .fi{flex:1;padding:9px 12px;background:#080808;border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#ccc;font-size:13px;outline:none;font-family:inherit;transition:border-color .15s}
        .fi:focus{border-color:#f5c842}
        .btn-add{padding:9px 14px;border-radius:8px;border:1px solid rgba(239,68,68,.2);background:rgba(239,68,68,.06);color:#ef4444;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .15s}
        .btn-add:hover{background:#ef4444;color:#fff}
        .list{display:flex;flex-direction:column;gap:6px}
        .list-item{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#080808;border:1px solid rgba(255,255,255,0.05);border-radius:7px}
        .mono{font-family:monospace;font-size:12px;color:#888}
        .rm{background:none;border:none;color:#333;cursor:pointer;font-size:13px;transition:color .15s;padding:2px 4px}
        .rm:hover{color:#ef4444}
        .empty-list{font-size:12px;color:#333;padding:8px 0}
        .toast{position:fixed;bottom:1.5rem;right:1.5rem;background:#0e0e0e;border:1px solid rgba(34,197,94,0.2);color:#22c55e;border-radius:10px;padding:10px 16px;font-size:13px;z-index:999}
      `}</style>
    </Layout>
  );
}
