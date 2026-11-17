import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { isOwner } from "../../lib/owners";

export default function AdminMaintenance() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState({ active: false, message: "Sedang dalam pemeliharaan. Mohon tunggu sebentar." });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
    if (status === "authenticated" && !isOwner(session?.user?.email)) router.replace("/dashboard");
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && isOwner(session?.user?.email))
      fetch("/api/admin?type=maintenance").then(r=>r.json()).then(setData);
  }, [status, session]);

  async function save() {
    setSaving(true);
    await fetch("/api/admin", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ type:"maintenance", data }) });
    setSaving(false);
    setToast("Tersimpan"); setTimeout(()=>setToast(""),3000);
  }

  return (
    <Layout bots={[]}>
      <div className="page">
        <button className="back" onClick={() => router.push("/dashboard")}>‹ Dashboard</button>
        <div className="ph"><h1>🔧 Maintenance Mode</h1><p>Aktifkan untuk memblokir akses user saat pemeliharaan</p></div>

        <div className="card">
          <div className="row">
            <div>
              <div className="rl">Status Maintenance</div>
              <div className="rs">{data.active ? "🔴 Aktif — user tidak bisa akses" : "🟢 Nonaktif — semua bisa akses"}</div>
            </div>
            <label className="tog">
              <input type="checkbox" checked={data.active} onChange={e => setData(p => ({...p, active: e.target.checked}))} />
              <div className="ttrack" />
            </label>
          </div>
          <div className="fr">
            <label className="fl">Pesan untuk User</label>
            <textarea className="ta" rows={3} value={data.message} onChange={e => setData(p => ({...p, message: e.target.value}))} />
          </div>
          <div className="note">⚠ Owner ({session?.user?.email}) tetap bisa akses meskipun maintenance aktif</div>
          <button className="btn-save" onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
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
        .row{display:flex;align-items:center;justify-content:space-between;padding:0 0 1.25rem;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:1.25rem}
        .rl{font-size:14px;font-weight:500;color:#fff;margin-bottom:4px}
        .rs{font-size:12px;color:#555}
        .tog{position:relative;display:inline-block;width:44px;height:24px}
        .tog input{opacity:0;width:0;height:0}
        .ttrack{position:absolute;inset:0;border-radius:24px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:.2s}
        .tog input:checked+.ttrack{background:#ef4444;border-color:#ef4444}
        .ttrack::after{content:'';position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:.2s}
        .tog input:checked+.ttrack::after{transform:translateX(20px)}
        .fr{margin-bottom:1rem}
        .fl{font-size:12px;color:#555;margin-bottom:6px;display:block}
        .ta{width:100%;padding:10px 12px;background:#080808;border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#ccc;font-size:13px;outline:none;resize:vertical;font-family:inherit;transition:border-color .15s}
        .ta:focus{border-color:#f5c842}
        .note{font-size:11px;color:#444;padding:8px 10px;background:#080808;border:1px solid rgba(245,200,66,0.1);border-radius:7px;margin-bottom:1rem}
        .btn-save{width:100%;padding:11px;background:#f5c842;color:#000;border:none;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s}
        .btn-save:hover{background:#e8a800}
        .btn-save:disabled{opacity:.5;cursor:not-allowed}
        .toast{position:fixed;bottom:1.5rem;right:1.5rem;background:#0e0e0e;border:1px solid rgba(34,197,94,0.2);color:#22c55e;border-radius:10px;padding:10px 16px;font-size:13px;z-index:999}
      `}</style>
    </Layout>
  );
}
