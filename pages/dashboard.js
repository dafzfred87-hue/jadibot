import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { isOwner } from "../lib/owners";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bots, setBots] = useState([]);
  const [loading, setLoad] = useState(true);
  const [working, setWork] = useState({});
  const [toast, setToast] = useState(null);
  const owner = isOwner(session?.user?.email);

  useEffect(() => { if (status === "unauthenticated") router.replace("/"); }, [status]);
  useEffect(() => { if (status === "authenticated") fetchBots(); }, [status]);

  const fetchBots = useCallback(async () => {
    setLoad(true);
    const r = await fetch("/api/bots");
    const d = await r.json();
    setBots(Array.isArray(d) ? d : []);
    setLoad(false);
  }, []);

  async function action(bot, act) {
    setWork(p => ({ ...p, [bot.id]: true }));
    const r = await fetch("/api/bots", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: bot.id, action: act }) });
    setWork(p => ({ ...p, [bot.id]: false }));
    r.ok ? (showToast(act + " berhasil"), fetchBots()) : showToast((await r.json()).error, true);
  }

  async function del(bot) {
    if (!confirm(`Hapus "${bot.name}"?`)) return;
    setWork(p => ({ ...p, [bot.id]: true }));
    const r = await fetch("/api/bots", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: bot.id }) });
    r.ok ? (showToast("Server dihapus"), setBots(p => p.filter(b => b.id !== bot.id))) : showToast((await r.json()).error, true);
    setWork(p => ({ ...p, [bot.id]: false }));
  }

  function showToast(msg, err=false) { setToast({msg,err}); setTimeout(()=>setToast(null),3000); }

  const active = bots.filter(b => !b.suspended).length;

  return (
    <Layout bots={bots}>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Dashboard {owner && <span className="owner-badge">👑 Owner</span>}</h1>
            <p>Selamat datang, {session?.user?.name?.split(" ")[0]} · Dafz Hosting Bot Panel</p>
          </div>
          <button className="btn-add" onClick={() => router.push("/add-bot")}>+ Tambah Bot</button>
        </div>

        {/* Dafz Store Banner */}
        <div className="store-banner">
          <div className="store-left">
            <div className="store-icon">🏪</div>
            <div>
              <div className="store-title">Dafz Store</div>
              <div className="store-desc">Layanan hosting, bot WA, dan produk digital terpercaya</div>
            </div>
          </div>
          <div className="store-tags">
            <span className="stag">🤖 Bot WA</span>
            <span className="stag">☁️ Hosting</span>
            <span className="stag">🔐 Panel</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            { label:"Total Server", val:bots.length, sub:"terdaftar", cls:"" },
            { label:"Running",      val:active,       sub:"online",    cls:"green" },
            { label:"Suspended",    val:bots.length-active, sub:"offline", cls:"amber" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className={`stat-val ${s.cls}`}>{s.val}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Owner quick links */}
        {owner && (
          <div className="owner-row">
            <div className="owner-title">👑 Owner Panel</div>
            <div className="owner-links">
              {[
                { label:"👥 Users",       href:"/admin/users" },
                { label:"🔧 Maintenance", href:"/admin/maintenance" },
                { label:"🛡️ Firewall",   href:"/admin/firewall" },
              ].map(l => (
                <button key={l.href} className="olink" onClick={() => router.push(l.href)}>{l.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Bot grid */}
        <div className="sec-title">
          <span>Server Bot</span>
          <button className="btn-add-sm" onClick={() => router.push("/add-bot")}>+ Tambah</button>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spin" /><span>Mengambil data dari Pterodactyl...</span></div>
        ) : bots.length === 0 ? (
          <div className="empty-wrap">
            <div>🤖</div>
            <h3>Belum ada bot</h3>
            <p>Tambah bot pertamamu sekarang</p>
            <button className="btn-prim" onClick={() => router.push("/add-bot")}>+ Tambah Bot</button>
          </div>
        ) : (
          <div className="bot-grid">
            {bots.map(bot => (
              <div key={bot.id} className={`bot-card ${!bot.suspended ? "running" : ""}`} onClick={() => router.push(`/bot/${bot.id}`)}>
                {working[bot.id] && <div className="card-loading"><div className="spin sm" /></div>}
                <div className="card-top">
                  <div className="card-left">
                    <div className="bot-icon">🤖</div>
                    <div>
                      <div className="bot-name">{bot.name}</div>
                      <div className="bot-num">{bot.phone || "—"}</div>
                    </div>
                  </div>
                  <span className={`sbadge ${!bot.suspended ? "on" : "off"}`}>
                    <div className={`sdot ${!bot.suspended ? "on" : "off"}`} />
                    {!bot.suspended ? "Running" : "Suspended"}
                  </span>
                </div>
                <div className="card-meta">
                  <span className="mtag">📁 {bot.folder || "Default"}</span>
                  <span className="mtag">🖥 ID: {bot.id}</span>
                </div>
                <div className="card-actions" onClick={e => e.stopPropagation()}>
                  {!bot.suspended ? (
                    <>
                      <button className="ca" disabled={working[bot.id]} onClick={() => action(bot,"restart")}>↺</button>
                      <button className="ca" disabled={working[bot.id]} onClick={() => action(bot,"stop")}>⏹</button>
                      <button className="ca amber" disabled={working[bot.id]} onClick={() => action(bot,"suspend")}>🔒</button>
                    </>
                  ) : (
                    <button className="ca green" disabled={working[bot.id]} onClick={() => action(bot,"unsuspend")}>▶ Aktifkan</button>
                  )}
                  <button className="ca red" disabled={working[bot.id]} onClick={() => del(bot)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className={`toast ${toast.err?"err":""}`}><span className="tdot">{toast.err?"✗":"✓"}</span>{toast.msg}</div>}

      <style jsx>{`
        .page{padding:2rem;max-width:1100px}
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;gap:1rem}
        .page-header h1{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;margin-bottom:4px;color:#fff;display:flex;align-items:center;gap:10px}
        .page-header p{font-size:13px;color:#555}
        .owner-badge{font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(245,200,66,0.1);color:#f5c842;border:1px solid rgba(245,200,66,0.2);font-weight:500}
        .btn-add{padding:9px 18px;border-radius:9px;border:1px solid rgba(245,200,66,0.2);background:rgba(245,200,66,0.08);color:#f5c842;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0}
        .btn-add:hover{background:#f5c842;color:#000}

        .store-banner{background:linear-gradient(135deg,#0e0e0e,#141414);border:1px solid rgba(245,200,66,0.12);border-radius:14px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
        .store-left{display:flex;align-items:center;gap:14px}
        .store-icon{width:44px;height:44px;border-radius:12px;background:rgba(245,200,66,0.1);border:1px solid rgba(245,200,66,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .store-title{font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:#fff;margin-bottom:2px}
        .store-desc{font-size:12px;color:#555}
        .store-tags{display:flex;gap:6px;flex-wrap:wrap}
        .stag{font-size:11px;padding:4px 10px;border-radius:20px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);color:#666}

        .stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:1.5rem}
        .stat-card{background:#0e0e0e;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:1.25rem 1.5rem}
        .stat-label{font-size:11px;color:#444;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
        .stat-val{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:#fff}
        .stat-val.green{color:#22c55e}
        .stat-val.amber{color:#f59e0b}
        .stat-sub{font-size:11px;color:#333;margin-top:2px}

        .owner-row{background:#0a0a0a;border:1px solid rgba(245,200,66,0.1);border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
        .owner-title{font-size:13px;font-weight:500;color:#f5c842;white-space:nowrap}
        .owner-links{display:flex;gap:8px;flex-wrap:wrap}
        .olink{padding:6px 14px;border-radius:8px;border:1px solid rgba(245,200,66,0.15);background:rgba(245,200,66,0.06);color:#f5c842;font-size:12px;cursor:pointer;transition:all .15s}
        .olink:hover{background:#f5c842;color:#000}

        .sec-title{font-size:13px;font-weight:500;color:#555;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between}
        .btn-add-sm{font-size:12px;padding:4px 12px;border-radius:7px;border:1px solid rgba(245,200,66,0.2);background:rgba(245,200,66,0.06);color:#f5c842;cursor:pointer;transition:all .15s}
        .btn-add-sm:hover{background:#f5c842;color:#000}

        .bot-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
        .bot-card{background:#0e0e0e;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:1.25rem;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
        .bot-card:hover{border-color:rgba(255,255,255,0.12);background:#111;transform:translateY(-1px)}
        .bot-card.running{border-color:rgba(34,197,94,0.15)}
        .bot-card.running::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#22c55e,transparent);opacity:.5}
        .card-loading{position:absolute;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:5;border-radius:14px}
        .card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px}
        .card-left{display:flex;align-items:center;gap:10px}
        .bot-icon{width:36px;height:36px;border-radius:9px;background:#141414;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .bot-name{font-size:14px;font-weight:500;color:#fff;margin-bottom:2px}
        .bot-num{font-size:11px;color:#444;font-family:monospace}
        .sbadge{font-size:11px;font-weight:500;padding:3px 9px;border-radius:20px;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
        .sbadge.on{background:rgba(34,197,94,0.08);color:#22c55e;border:1px solid rgba(34,197,94,0.2)}
        .sbadge.off{background:#0a0a0a;color:#444;border:1px solid rgba(255,255,255,0.06)}
        .sdot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .sdot.on{background:#22c55e;box-shadow:0 0 5px #22c55e}
        .sdot.off{background:#333}
        .card-meta{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
        .mtag{font-size:11px;color:#444;background:#0a0a0a;border:1px solid rgba(255,255,255,0.05);padding:2px 8px;border-radius:5px}
        .card-actions{display:flex;gap:6px}
        .ca{padding:6px 10px;border-radius:7px;border:1px solid rgba(255,255,255,0.08);background:none;color:#555;font-size:12px;cursor:pointer;transition:all .15s}
        .ca:hover{background:#141414;color:#fff;border-color:rgba(255,255,255,0.14)}
        .ca:disabled{opacity:.4;cursor:not-allowed}
        .ca.green{color:#22c55e;border-color:rgba(34,197,94,0.2)}
        .ca.green:hover{background:rgba(34,197,94,0.08)}
        .ca.amber:hover{border-color:rgba(245,158,11,.3);color:#f59e0b;background:rgba(245,158,11,.06)}
        .ca.red:hover{border-color:rgba(239,68,68,.3);color:#ef4444;background:rgba(239,68,68,.06)}

        .loading-wrap{display:flex;align-items:center;gap:12px;padding:4rem 0;color:#444;font-size:14px}
        .empty-wrap{display:flex;flex-direction:column;align-items:center;padding:5rem 2rem;text-align:center;gap:.75rem;font-size:40px}
        .empty-wrap h3{font-size:18px;font-weight:600;color:#fff}
        .empty-wrap p{font-size:13px;color:#555}
        .btn-prim{margin-top:.5rem;padding:10px 20px;background:#f5c842;color:#000;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer}

        .spin{width:20px;height:20px;border:2px solid #1a1a1a;border-top-color:#f5c842;border-radius:50%;animation:s 1s linear infinite}
        .spin.sm{width:18px;height:18px}
        @keyframes s{to{transform:rotate(360deg)}}
        .toast{position:fixed;bottom:1.5rem;right:1.5rem;background:#0e0e0e;border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:10px;padding:10px 16px;font-size:13px;display:flex;align-items:center;gap:8px;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,.8)}
        .toast.err{border-color:rgba(239,68,68,.3)}
        .tdot{width:18px;height:18px;border-radius:50%;background:#22c55e;color:#000;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
        .toast.err .tdot{background:#ef4444;color:#fff}
        @media(max-width:640px){.stats-row{grid-template-columns:repeat(2,1fr)}.bot-grid{grid-template-columns:1fr}.page{padding:1.25rem}.store-banner{flex-direction:column}.store-tags{display:none}}
      `}</style>
    </Layout>
  );
}
