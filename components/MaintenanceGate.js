import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { isOwner } from "../lib/owners";

export default function MaintenanceGate({ children }) {
  const { data: session, status } = useSession();
  const [maintenance, setMaintenance] = useState(null);

  useEffect(() => {
    fetch("/api/maintenance").then(r => r.json()).then(setMaintenance);
  }, []);

  if (maintenance === null) return null;
  if (!maintenance.active) return children;
  if (status === "authenticated" && isOwner(session?.user?.email)) return children;

  return (
    <div className="wrap">
      <div className="glow" />
      <div className="box">
        <div className="icon">🔧</div>
        <h1>Under Maintenance</h1>
        <p>{maintenance.message || "Sedang dalam pemeliharaan. Mohon tunggu sebentar."}</p>
        <div className="badge">Dafz Hosting</div>
      </div>
      <style jsx>{`
        .wrap{min-height:100vh;background:#000;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
        .glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;background:radial-gradient(ellipse,rgba(245,200,66,0.06),transparent 70%);pointer-events:none}
        .box{text-align:center;padding:3rem 2rem;position:relative;z-index:1}
        .icon{font-size:56px;margin-bottom:1.5rem;animation:spin 4s linear infinite}
        @keyframes spin{0%,100%{transform:rotate(0deg)}50%{transform:rotate(20deg)}}
        h1{font-family:'Space Grotesk',sans-serif;font-size:2rem;font-weight:700;color:#fff;margin-bottom:1rem}
        p{font-size:15px;color:#666;max-width:400px;line-height:1.6;margin:0 auto 2rem}
        .badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:20px;border:1px solid rgba(245,200,66,0.2);background:rgba(245,200,66,0.06);color:#f5c842;font-size:12px;font-weight:500}
      `}</style>
    </div>
  );
}
