import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
const S = { FORM:"form", OTP:"otp", CREATING:"creating", DONE:"done" };
export default function AddBot() {
  const { status } = useSession();
  const router = useRouter();
  const [step,setStep]=[useState(S.FORM),(v)=>setStep(v)];
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [folder,setFolder]=useState("WhatsApp");
  const [otp,setOtp]=useState(["","","","","",""]);
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const refs=useRef([]);
  useEffect(()=>{if(status==="unauthenticated")router.replace("/");},[status]);
  const [st,setSt]=useState(S.FORM);
  async function sendOTP(){
    if(!name.trim())return setErr("Nama bot wajib.");
    if(!phone.trim())return setErr("Nomor WA wajib.");
    setErr("");setBusy(true);
    const r=await fetch("/api/otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,action:"request"})});
    setBusy(false);
    r.ok?(setSt(S.OTP),setTimeout(()=>refs.current[0]?.focus(),100)):setErr((await r.json()).error);
  }
  function otpChange(val,i){const d=[...otp];d[i]=val.replace(/\D/,"");setOtp(d);if(d[i]&&i<5)refs.current[i+1]?.focus();}
  async function verify(){
    const code=otp.join("");
    if(code.length<6)return setErr("Masukkan 6 digit OTP.");
    setErr("");setBusy(true);
    const vr=await fetch("/api/otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,otp:code,action:"verify"})});
    if(!vr.ok){setBusy(false);return setErr((await vr.json()).error);}
    setSt(S.CREATING);
    const cr=await fetch("/api/bots",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,phone,folder})});
    setBusy(false);
    cr.ok?setSt(S.DONE):setErr((await cr.json()).error||"Gagal buat server");
    if(cr.ok)setTimeout(()=>router.push("/dashboard"),2000);
  }
  return (
    <Layout bots={[]}>
      <div className="page">
        <button className="back" onClick={()=>st===S.OTP?setSt(S.FORM):router.back()}>‹ Kembali</button>
        {st===S.FORM&&(<>
          <div className="ph"><h1>Tambah Bot Baru</h1><p>Bot akan berjalan sebagai server di Pterodactyl panel</p></div>
          <div className="card">
            <div className="card-label">Konfigurasi Server Bot</div>
            {[{l:"Nama Bot",t:"text",v:name,s:setName,p:"cth. Bot Penjualan Utama"},{l:"Nomor WhatsApp",t:"tel",v:phone,s:setPhone,p:"+62 812-xxxx-xxxx"}].map(f=>(
              <div key={f.l} className="fr"><label className="fl">{f.l}</label><input className="fi" type={f.t} placeholder={f.p} value={f.v} onChange={e=>f.s(e.target.value)}/></div>
            ))}
            <div className="fr">
              <label className="fl">Folder</label>
              <select className="fi" value={folder} onChange={e=>setFolder(e.target.value)}>
                {["WhatsApp","Telegram","Lainnya"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            {err&&<p className="err">⚠ {err}</p>}
            <button className="btn-prim" onClick={sendOTP} disabled={busy}>{busy?"Mengirim...":"Kirim OTP →"}</button>
          </div>
        </>)}
        {st===S.OTP&&(<>
          <div className="ph"><h1>Verifikasi OTP</h1><p>Kode dikirim ke {phone}</p></div>
          <div className="card">
            <div className="card-label">Masukkan 6 Digit OTP</div>
            <div className="ohint"><div className="spin"/>Menunggu OTP WhatsApp...</div>
            <div className="orow">{otp.map((v,i)=><input key={i} ref={el=>refs.current[i]=el} className="obox" type="text" inputMode="numeric" maxLength={1} value={v} onChange={e=>otpChange(e.target.value,i)} onKeyDown={e=>e.key==="Backspace"&&!v&&i>0&&refs.current[i-1]?.focus()}/>)}</div>
            {err&&<p className="err">⚠ {err}</p>}
            <button className="btn-prim" onClick={verify} disabled={busy}>{busy?"Memverifikasi...":"Verifikasi & Buat Server"}</button>
            <p className="rsnd">Belum terima? <span onClick={sendOTP}>Kirim ulang</span></p>
          </div>
        </>)}
        {st===S.CREATING&&<div className="center"><div className="spin lg"/><p>Membuat server di Pterodactyl...</p></div>}
        {st===S.DONE&&<div className="center"><div style={{fontSize:52}}>🎉</div><h2>Server berhasil dibuat!</h2><p>Mengalihkan ke dashboard...</p></div>}
      </div>
      <style jsx>{`
        .page{padding:2rem;max-width:520px}
        .back{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text2);background:none;border:none;cursor:pointer;padding:0;margin-bottom:1.5rem;transition:color .15s}
        .back:hover{color:var(--text)}
        .ph{margin-bottom:1.75rem}
        .ph h1{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;margin-bottom:4px}
        .ph p{font-size:13px;color:var(--text2)}
        .card{background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:1.5rem}
        .card-label{font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:1.25rem}
        .fr{margin-bottom:1rem}
        .fl{font-size:12px;color:var(--text2);margin-bottom:6px;display:block}
        .fi{width:100%;padding:10px 12px;background:var(--bg);border:1px solid var(--border2);border-radius:8px;color:var(--text);font-size:14px;outline:none;transition:border-color .15s}
        .fi:focus{border-color:var(--gold)}
        .btn-prim{width:100%;padding:11px;background:var(--gold);color:#000;border:none;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;font-family:'Space Grotesk',sans-serif}
        .btn-prim:hover{background:var(--gold2)}
        .btn-prim:disabled{opacity:.5;cursor:not-allowed}
        .err{font-size:12px;color:var(--red);margin-bottom:1rem;padding:8px 10px;background:var(--red-bg);border:1px solid var(--red-border);border-radius:7px}
        .ohint{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text3);margin-bottom:1rem}
        .orow{display:flex;gap:8px;margin-bottom:1rem}
        .obox{flex:1;padding:12px 0;text-align:center;font-size:20px;font-weight:600;background:var(--bg);border:1px solid var(--border2);border-radius:8px;color:var(--text);font-family:monospace;outline:none;transition:border-color .15s}
        .obox:focus{border-color:var(--gold)}
        .rsnd{text-align:center;font-size:12px;color:var(--text3);margin-top:1rem}
        .rsnd span{color:var(--gold);cursor:pointer}
        .spin{width:14px;height:14px;border:2px solid var(--border2);border-top-color:var(--gold);border-radius:50%;animation:s 1s linear infinite;flex-shrink:0}
        .spin.lg{width:36px;height:36px;border-width:3px;margin:0 auto 1rem}
        @keyframes s{to{transform:rotate(360deg)}}
        .center{display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:1rem;text-align:center}
        .center h2{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700}
        .center p{color:var(--text2);font-size:13px}
      `}</style>
    </Layout>
  );
}
