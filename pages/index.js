import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Landing() {
  const { status } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // Langsung ke dashboard kalau udah login
  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="loading">
        <div className="spin" />
        <style jsx>{`.loading{min-height:100vh;background:#000;display:flex;align-items:center;justify-content:center}.spin{width:32px;height:32px;border:3px solid #222;border-top-color:#f5c842;border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="grid-bg" />
      <div className="glow-gold" />
      <div className="glow-green" />

      <nav className="nav">
        <div className="logo">
          <div className="lmark">D</div>
          <span>Dafz <span className="gold">Hosting</span></span>
        </div>
        <div className="nav-right">
          <span className="nbadge">Bot Panel v2</span>
          <div className="live-dot" /><span className="live-txt">Live</span>
        </div>
      </nav>

      <main className="hero">
        <div className="htag"><div className="pulse" /> Platform Manajemen Bot WA</div>
        <h1>Kelola Bot<br /><span className="gold">WhatsApp</span> Kamu<br />Dari Satu Panel</h1>
        <p>Powered by Pterodactyl. Deploy, monitor, dan kontrol<br />semua bot WhatsApp dalam satu dashboard elegan.</p>

        <button className="btn-start" onClick={() => { setBusy(true); signIn("google", { callbackUrl: "/dashboard" }); }} disabled={busy}>
          {busy ? <><div className="bspin" />Memuat...</> : <><span>Mulai Sekarang</span><span className="arr">→</span></>}
        </button>
        <div className="login-note">Login dengan Google · Gratis · Aman</div>

        <div className="stats">
          {[["99.9%","Uptime"],["< 1s","Response"],["∞","Bot Slots"],["24/7","Support"]].map(([v,l]) => (
            <div key={l} className="stat"><div className="sv">{v}</div><div className="sl">{l}</div></div>
          ))}
        </div>
      </main>

      <section className="features">
        {[
          ["⚡","Instant Deploy","Bot baru aktif di Pterodactyl dalam hitungan detik"],
          ["📊","Live Monitor","Pantau CPU, RAM, Disk bot secara realtime"],
          ["🔒","Secure Login","Autentikasi Google OAuth, data terisolasi per akun"],
          ["🎛️","Full Control","Start, stop, restart, suspend dari dashboard"],
          ["🛡️","Firewall","Proteksi akses dengan sistem firewall terintegrasi"],
          ["🔧","Maintenance Mode","Kontrol akses user saat pemeliharaan sistem"],
        ].map(([icon,title,desc]) => (
          <div key={title} className="fcard">
            <div className="ficon">{icon}</div>
            <div className="ftitle">{title}</div>
            <div className="fdesc">{desc}</div>
          </div>
        ))}
      </section>

      <footer className="footer">
        <span>© 2026 <strong>Dafz Hosting</strong></span>
        <span className="sep">·</span>
        <span>Powered by Pterodactyl</span>
        <span className="sep">·</span>
        <span>All rights reserved</span>
      </footer>

      <style jsx>{`
        .wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;position:relative;overflow:hidden;background:#000}
        .grid-bg{position:fixed;inset:0;z-index:0;background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:40px 40px}
        .glow-gold{position:fixed;top:-150px;left:50%;transform:translateX(-50%);width:700px;height:500px;z-index:0;background:radial-gradient(ellipse,rgba(245,200,66,0.07) 0%,transparent 70%);pointer-events:none}
        .glow-green{position:fixed;bottom:-200px;right:-100px;width:500px;height:500px;z-index:0;background:radial-gradient(ellipse,rgba(34,197,94,0.04) 0%,transparent 70%);pointer-events:none}
        .nav{width:100%;max-width:1000px;padding:1.5rem 2rem;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:10}
        .logo{display:flex;align-items:center;gap:10px;font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;color:#fff}
        .lmark{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#f5c842,#e8a800);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#000}
        .gold{color:#f5c842}
        .nav-right{display:flex;align-items:center;gap:10px}
        .nbadge{font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);color:#666;background:#0e0e0e}
        .live-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:p 2s ease-in-out infinite}
        .live-txt{font-size:12px;color:#22c55e}
        @keyframes p{0%,100%{opacity:1}50%{opacity:.4}}
        .hero{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3rem 2rem 2rem;position:relative;z-index:10;max-width:700px}
        .htag{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:#555;border:1px solid rgba(255,255,255,0.08);background:#0e0e0e;padding:6px 14px;border-radius:20px;margin-bottom:2rem}
        .pulse{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:p 2s ease-in-out infinite}
        h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(2.2rem,8vw,3.8rem);font-weight:700;line-height:1.1;letter-spacing:-0.02em;margin-bottom:1.5rem;color:#fff}
        p{font-size:15px;color:#555;line-height:1.7;margin-bottom:2.5rem}
        .btn-start{display:flex;align-items:center;gap:10px;padding:14px 32px;border-radius:12px;border:none;background:linear-gradient(135deg,#f5c842,#e8a800);color:#000;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'Space Grotesk',sans-serif;box-shadow:0 0 40px rgba(245,200,66,0.2);margin-bottom:12px}
        .btn-start:hover{transform:translateY(-2px);box-shadow:0 0 60px rgba(245,200,66,0.35)}
        .btn-start:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .arr{font-size:18px}
        .bspin{width:14px;height:14px;border:2px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:s 1s linear infinite}
        @keyframes s{to{transform:rotate(360deg)}}
        .login-note{font-size:12px;color:#333;margin-bottom:2.5rem}
        .stats{display:flex;gap:2.5rem}
        .stat{text-align:center}
        .sv{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:#f5c842}
        .sl{font-size:11px;color:#444;margin-top:2px}
        .features{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:900px;width:100%;padding:0 2rem 4rem;position:relative;z-index:10}
        .fcard{background:#0e0e0e;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:1.25rem;transition:border-color .2s}
        .fcard:hover{border-color:rgba(255,255,255,0.12)}
        .ficon{font-size:22px;margin-bottom:10px}
        .ftitle{font-size:13px;font-weight:600;color:#fff;margin-bottom:6px}
        .fdesc{font-size:12px;color:#555;line-height:1.5}
        .footer{width:100%;text-align:center;padding:1.5rem;font-size:12px;color:#333;border-top:1px solid rgba(255,255,255,0.05);position:relative;z-index:10;display:flex;align-items:center;justify-content:center;gap:8px}
        .sep{color:#222}
        @media(max-width:640px){.features{grid-template-columns:repeat(2,1fr)}.stats{gap:1.5rem}}
      `}</style>
    </div>
  );
}
