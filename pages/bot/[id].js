import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
export default function BotDetail() {
  const { status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [bots,setBots]=useState([]);
  const [bot,setBot]=useState(null);
  const [res,setRes]=useState(null);
  const [busy,setBusy]=useState(false);
  const [toast,setToast]=useState(null);
  useEffect(()=>{if(status==="unauthenticated")router.replace("/");},[status]);
  useEffect(()=>{
    if(status==="authenticated"){
      fetch("/api/bots").then(r=>r.json()).then(d=>{
        const list=Array.isArray(d)?d:[];
        setBots(list);
        if(id)setBot(list.find(b=>String(b.id)===String(id))||null);
      });
    }
  },[status,id]);
  const fetchRes=useCallback(async()=>{
    if(!bot?.identifier)return;
    const r=await fetch(`/api/resources?identifier=${bot.identifier}`);
    if(r.ok)setRes(await r.json());
  },[bot]);
  useEffect(()=>{ fetchRes(); const t=setInterval(fetchRes,5000); return()=>clearInterval(t); },[fetchRes]);
  async function act(a){
    setBusy(true);
    const r=await fetch("/api/bots",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:bot.id,action:a})});
    setBusy(false);
    r.ok?(setToast({msg:a+" berhasil"}),setTimeout(fetchRes,1500)):setToast({msg:(await r.json()).error,err:true});
    setTimeout(()=>setToast(null),3000);
  }
  async function del(){
    if(!confirm(`Hapus server "${bot.name}"?`))return;
    setBusy(true);
    const r=await fetch("/api/bots",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:bot.id})});
    if(r.ok)router.push("/dashboard");
    else{setBusy(false);setToast({msg:"Gagal hapus",err:true});}
  }
  if(!bot)return<Layout bots={bots}><div className="center"><div className="spin"/></div><style jsx>{`.center{display:flex;align-items:center;justify-content:center;height:60vh}.spin{width:32px;height:32px;border:3px solid var(--border2);border-top-color:var(--gold);border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}`}</style></Layout>;
  const running=res?.running??!bot.suspended;
  const pct=(v,max)=>Math.min((v/max)*100||0,100);
  return (
    <Layout bots={bots}>
      <div className="page">
        <button className="back" onClick={()=>router.push("/dashboard")}>‹ Kembali</button>
        <div className="ph">
          <div className="ph-left">
            <div className="bot-icon">🤖</div>
            <div><h1>{bot.name}</h1><p>Server ID: {bot.id} · {bot.identifier}</p></div>
          </div>
          <span className={`sbadge ${running?"on":"off"}`}>
            <div className={`sdot ${running?"on":"off"}`}/>{running?"Running":"Suspended"}
          </span>
        </div>

        <div className="grid">
          {/* Info */}
          <div className="card">
            <div className="card-title">Info Server</div>
            {[["Nomor WA",bot.phone],["Folder",bot.folder],["UUID",bot.uuid],["Dibuat",new Date(bot.createdAt).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})]].map(([k,v])=>(
              <div key={k} className="row"><span className="rl">{k}</span><span className={`rv ${k==="UUID"?"mono":""}`}>{v}</span></div>
            ))}
          </div>

          {/* Resources */}
          <div className="card">
            <div className="card-title">Resources <span className="live">● Live</span></div>
            {res?(
              <>
                {[
                  {label:"CPU",val:`${res.cpu}%`,pct:parseFloat(res.cpu),color:"var(--gold)"},
                  {label:"RAM",val:`${res.memory_mb} MB`,pct:pct(res.memory_mb,bot.limits?.memory||512),color:"var(--blue)"},
                  {label:"Disk",val:`${res.disk_mb} MB`,pct:pct(res.disk_mb,bot.limits?.disk||1024),color:"var(--green)"},
                ].map(r=>(
                  <div key={r.label} className="res-row">
                    <div className="res-top"><span className="rl">{r.label}</span><span className="rv mono">{r.val}</span></div>
                    <div className="res-bar"><div className="res-fill" style={{width:`${r.pct}%`,background:r.color}}/></div>
                  </div>
                ))}
                <div className="net-row">
                  <span className="rl">Network</span>
                  <span className="rv mono">↓{res.rx_kb}KB ↑{res.tx_kb}KB</span>
                </div>
              </>
            ):<div className="dimmed">Memuat resource...</div>}
          </div>

          {/* Controls */}
          <div className="card ctrl-card">
            <div className="card-title">Kontrol</div>
            <div className="ctrl-grid">
              <button className={`cb green`} disabled={busy} onClick={()=>act("start")}>▶ Start</button>
              <button className={`cb warn`}  disabled={busy} onClick={()=>act("stop")}>⏹ Stop</button>
              <button className={`cb warn`}  disabled={busy} onClick={()=>act("restart")}>↺ Restart</button>
              <button className={`cb warn`}  disabled={busy} onClick={()=>act("kill")}>⚡ Kill</button>
              {!bot.suspended
                ?<button className={`cb blue`} disabled={busy} onClick={()=>act("suspend")}>🔒 Suspend</button>
                :<button className={`cb green`} disabled={busy} onClick={()=>act("unsuspend")}>🔓 Unsuspend</button>}
              <button className={`cb red`} disabled={busy} onClick={del}>🗑 Hapus Server</button>
            </div>
          </div>

          {/* Limits */}
          <div className="card">
            <div className="card-title">Limits</div>
            {bot.limits&&Object.entries({CPU:`${bot.limits.cpu}%`,Memory:`${bot.limits.memory} MB`,Disk:`${bot.limits.disk} MB`,IO:bot.limits.io}).map(([k,v])=>(
              <div key={k} className="row"><span className="rl">{k}</span><span className="rv mono">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
      {toast&&<div className={`toast ${toast.err?"err":""}`}><span className="tdot">{toast.err?"✗":"✓"}</span>{toast.msg}</div>}
      <style jsx>{`
        .page{padding:2rem;max-width:860px}
        .back{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text2);background:none;border:none;cursor:pointer;padding:0;margin-bottom:1.5rem;transition:color .15s}
        .back:hover{color:var(--text)}
        .ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;gap:1rem}
        .ph-left{display:flex;align-items:center;gap:14px}
        .bot-icon{width:48px;height:48px;border-radius:12px;background:var(--bg3);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
        .ph h1{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;margin-bottom:3px}
        .ph p{font-size:11px;color:var(--text3);font-family:monospace}
        .sbadge{font-size:12px;font-weight:500;padding:5px 12px;border-radius:20px;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
        .sbadge.on{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
        .sbadge.off{background:var(--bg3);color:var(--text3);border:1px solid var(--border)}
        .sdot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
        .sdot.on{background:var(--green);box-shadow:0 0 6px var(--green)}
        .sdot.off{background:var(--text3)}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .card{background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:1.25rem}
        .card-title{font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:1rem;display:flex;align-items:center;gap:8px}
        .live{color:var(--green);font-size:11px;animation:pulse 2s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)}
        .row:last-child{border-bottom:none}
        .rl{font-size:12px;color:var(--text3)}
        .rv{font-size:13px}
        .rv.mono{font-family:monospace;font-size:12px;color:var(--text2)}
        .res-row{margin-bottom:10px}
        .res-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
        .res-bar{height:3px;background:var(--bg3);border-radius:2px;overflow:hidden}
        .res-fill{height:100%;border-radius:2px;transition:width .5s ease}
        .net-row{display:flex;align-items:center;justify-content:space-between;padding-top:4px;border-top:1px solid var(--border)}
        .dimmed{color:var(--text3);font-size:13px;padding:.5rem 0}
        .ctrl-card{}
        .ctrl-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .cb{padding:10px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .15s}
        .cb:disabled{opacity:.4;cursor:not-allowed}
        .cb.green{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
        .cb.green:hover:not(:disabled){background:var(--green);color:#fff}
        .cb.warn{background:var(--bg3);color:var(--text2);border:1px solid var(--border2)}
        .cb.warn:hover:not(:disabled){background:rgba(245,158,11,.08);color:#f59e0b;border-color:rgba(245,158,11,.3)}
        .cb.blue{background:var(--blue-bg);color:var(--blue);border:1px solid rgba(59,130,246,.2)}
        .cb.blue:hover:not(:disabled){background:var(--blue);color:#fff}
        .cb.red{background:var(--red-bg);color:var(--red);border:1px solid var(--red-border);grid-column:span 2}
        .cb.red:hover:not(:disabled){background:var(--red);color:#fff}
        .toast{position:fixed;bottom:1.5rem;right:1.5rem;background:var(--bg2);border:1px solid var(--border3);color:var(--text);border-radius:10px;padding:10px 16px;font-size:13px;display:flex;align-items:center;gap:8px;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,.5)}
        .toast.err{border-color:var(--red-border)}
        .tdot{width:18px;height:18px;border-radius:50%;background:var(--green);color:#000;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
        .toast.err .tdot{background:var(--red);color:#fff}
        @media(max-width:640px){.grid{grid-template-columns:1fr}.page{padding:1.25rem}}
      `}</style>
    </Layout>
  );
}
