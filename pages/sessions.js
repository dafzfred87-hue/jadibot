import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
export default function Sessions() {
  const { status } = useSession();
  const router = useRouter();
  const [bots,setBots]=useState([]);
  const [busy,setBusy]=useState({});
  const [toast,setToast]=useState(null);
  useEffect(()=>{if(status==="unauthenticated")router.replace("/");},[status]);
  useEffect(()=>{if(status==="authenticated")fetch("/api/bots").then(r=>r.json()).then(d=>setBots(Array.isArray(d)?d:[]));},[status]);
  async function toggle(bot){
    const act=bot.suspended?"unsuspend":"suspend";
    setBusy(p=>({...p,[bot.id]:true}));
    const r=await fetch("/api/bots",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:bot.id,action:act})});
    setBusy(p=>({...p,[bot.id]:false}));
    if(r.ok){setBots(p=>p.map(b=>b.id===bot.id?{...b,suspended:!bot.suspended}:b));setToast(act==="suspend"?"Suspended":"Diaktifkan");}
    setTimeout(()=>setToast(null),3000);
  }
  async function del(bot){
    if(!confirm(`Hapus "${bot.name}"?`))return;
    setBusy(p=>({...p,[bot.id]:true}));
    const r=await fetch("/api/bots",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:bot.id})});
    if(r.ok){setBots(p=>p.filter(b=>b.id!==bot.id));setToast("Server dihapus");}
    setBusy(p=>({...p,[bot.id]:false}));
    setTimeout(()=>setToast(null),3000);
  }
  return (
    <Layout bots={bots}>
      <div className="page">
        <div className="ph"><h1>Sesi Aktif</h1><p>Kelola semua server Pterodactyl</p></div>
        <div className="tw">
          <div className="tt"><span>Server ({bots.length})</span><button className="btn-add" onClick={()=>router.push("/add-bot")}>+ Tambah</button></div>
          {bots.length===0?<div className="empty">Belum ada server. <span onClick={()=>router.push("/add-bot")}>Tambah →</span></div>:(
            <table className="tbl">
              <thead><tr><th>Nama</th><th>Nomor</th><th>Status</th><th>Aktif</th><th>Aksi</th></tr></thead>
              <tbody>{bots.map(bot=>(
                <tr key={bot.id}>
                  <td><strong style={{cursor:"pointer",color:"var(--text)"}} onClick={()=>router.push(`/bot/${bot.id}`)}>{bot.name}</strong><div className="bot-id">ID: {bot.id}</div></td>
                  <td className="mono">{bot.phone}</td>
                  <td><span className={`badge ${!bot.suspended?"on":"off"}`}>{!bot.suspended?<><span className="sdot on"/>Running</>:"⭘ Suspended"}</span></td>
                  <td><label className="tog"><input type="checkbox" checked={!bot.suspended} disabled={busy[bot.id]} onChange={()=>toggle(bot)}/><div className="ttrack"/></label></td>
                  <td><button className="bdel" disabled={busy[bot.id]} onClick={()=>del(bot)}>Hapus</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      {toast&&<div className="toast">✓ {toast}</div>}
      <style jsx>{`
        .page{padding:2rem}
        .ph{margin-bottom:1.75rem}
        .ph h1{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;margin-bottom:4px}
        .ph p{font-size:13px;color:var(--text2)}
        .tw{background:var(--card);border:1px solid var(--border);border-radius:var(--rl);overflow:hidden}
        .tt{padding:1rem 1.25rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:500}
        .btn-add{font-size:12px;padding:5px 12px;border-radius:7px;border:1px solid var(--gold-border);background:var(--gold-bg);color:var(--gold);cursor:pointer;transition:all .15s}
        .btn-add:hover{background:var(--gold);color:#000}
        .tbl{width:100%;border-collapse:collapse}
        .tbl th{text-align:left;font-size:11px;font-weight:500;color:var(--text3);padding:8px 12px;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.06em}
        .tbl td{font-size:13px;padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle}
        .tbl tr:last-child td{border-bottom:none}
        .tbl tr:hover td{background:rgba(255,255,255,.02)}
        .bot-id{font-size:10px;color:var(--text3);font-family:monospace;margin-top:2px}
        .mono{font-family:monospace;font-size:12px;color:var(--text2)}
        .badge{font-size:11px;font-weight:500;padding:3px 9px;border-radius:20px;display:inline-flex;align-items:center;gap:5px}
        .badge.on{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
        .badge.off{background:var(--bg3);color:var(--text3);border:1px solid var(--border)}
        .sdot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 5px var(--green);flex-shrink:0}
        .tog{position:relative;display:inline-block;width:36px;height:20px}
        .tog input{opacity:0;width:0;height:0}
        .ttrack{position:absolute;inset:0;border-radius:20px;background:var(--bg3);border:1px solid var(--border2);cursor:pointer;transition:.2s}
        .tog input:checked+.ttrack{background:var(--green);border-color:var(--green)}
        .ttrack::after{content:'';position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:.2s}
        .tog input:checked+.ttrack::after{transform:translateX(16px)}
        .tog input:disabled+.ttrack{opacity:.4;cursor:not-allowed}
        .bdel{font-size:12px;padding:5px 10px;border-radius:7px;cursor:pointer;border:1px solid var(--border2);background:none;color:var(--text2);transition:all .15s}
        .bdel:hover{border-color:var(--red-border);color:var(--red);background:var(--red-bg)}
        .bdel:disabled{opacity:.4;cursor:not-allowed}
        .empty{padding:2.5rem;text-align:center;color:var(--text2);font-size:14px}
        .empty span{color:var(--gold);cursor:pointer}
        .toast{position:fixed;bottom:1.5rem;right:1.5rem;background:var(--bg2);border:1px solid var(--green-border);color:var(--green);border-radius:10px;padding:10px 16px;font-size:13px;font-weight:500;z-index:999}
        @media(max-width:768px){.tbl{display:block;overflow-x:auto}}
      `}</style>
    </Layout>
  );
}
