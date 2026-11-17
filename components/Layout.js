import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";

export default function Layout({ children, bots = [] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [openFolders, setOpenFolders] = useState({ WhatsApp: true });
  const [mobileOpen, setMobileOpen] = useState(false);

  const folders = [...new Set(bots.map((b) => b.folder || "Default"))];

  const navItems = [
    { href: "/dashboard", icon: "▦",  label: "Dashboard" },
    { href: "/sessions",  icon: "⊟", label: "Sesi Aktif" },
    { href: "/add-bot",   icon: "⊕",  label: "Tambah Bot" },
  ];

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}

      <nav className={`sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">D</div>
          <div>
            <div className="logo-name">Dafz <span className="gold">Hosting</span></div>
            <div className="logo-sub">Bot Panel</div>
          </div>
        </div>

        {/* Nav */}
        <div className="nav-section">
          {navItems.map((item) => (
            <div key={item.href}
              className={`nav-item ${router.pathname === item.href ? "active" : ""}`}
              onClick={() => { router.push(item.href); setMobileOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* Folders */}
        <div className="nav-section">
          <div className="section-label">Bot Servers</div>
          {folders.map((folder) => (
            <div key={folder} className="folder-group">
              <div className="folder-header"
                onClick={() => setOpenFolders((p) => ({ ...p, [folder]: !p[folder] }))}>
                <span className="folder-icon">▸</span>
                <span>{folder}</span>
                <span className={`farrow ${openFolders[folder] ? "open" : ""}`}>‹</span>
              </div>
              {openFolders[folder] && bots.filter((b) => (b.folder || "Default") === folder).map((bot) => (
                <div key={bot.id}
                  className={`fbot ${router.query.id == bot.id ? "sel" : ""}`}
                  onClick={() => { router.push(`/bot/${bot.id}`); setMobileOpen(false); }}>
                  <div className={`sdot ${!bot.suspended ? "on" : "off"}`} />
                  <span className="fbot-name">{bot.name}</span>
                </div>
              ))}
              {openFolders[folder] && bots.filter((b) => (b.folder || "Default") === folder).length === 0 && (
                <div className="fbot-empty">Belum ada bot</div>
              )}
            </div>
          ))}
          {folders.length === 0 && (
            <div className="empty-bots">Belum ada bot aktif</div>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-row">
            {session?.user?.image
              ? <Image src={session.user.image} width={28} height={28} alt="av" className="uavatar" />
              : <div className="uavatar-fallback">{session?.user?.name?.charAt(0)}</div>}
            <div className="uinfo">
              <div className="uname">{session?.user?.name?.split(" ")[0]}</div>
              <div className="uemail">{session?.user?.email}</div>
            </div>
            <button className="logout-btn" title="Logout"
              onClick={() => signOut({ callbackUrl: "/" })}>⇥</button>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setMobileOpen(true)}>☰</button>
        <div className="mobile-logo">Dafz <span className="gold">Hosting</span></div>
      </div>

      <main className="main-content">{children}</main>

      <style jsx global>{`
        :global(.uavatar) { border-radius:50% !important; }
      `}</style>
      <style jsx>{`
        .layout { display:flex; min-height:100vh; background:var(--black); }
        .overlay { position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:40; }

        .sidebar {
          width:220px; min-height:100vh; flex-shrink:0;
          background:var(--bg); border-right:1px solid var(--border);
          display:flex; flex-direction:column;
          position:sticky; top:0; height:100vh; overflow-y:auto;
        }
        .sidebar-logo {
          display:flex; align-items:center; gap:10px;
          padding:1.25rem 1rem 1rem;
          border-bottom:1px solid var(--border);
        }
        .logo-mark {
          width:34px; height:34px; border-radius:9px; flex-shrink:0;
          background:linear-gradient(135deg,#f5c842,#e8a800);
          display:flex; align-items:center; justify-content:center;
          font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; color:#000;
        }
        .logo-name { font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:600; }
        .gold { color:var(--gold); }
        .logo-sub { font-size:10px; color:var(--text3); margin-top:1px; }

        .nav-section { padding:0.75rem 0.6rem; border-bottom:1px solid var(--border); }
        .section-label { font-size:10px; color:var(--text3); padding:0 0.4rem; margin-bottom:4px; letter-spacing:.08em; text-transform:uppercase; font-weight:500; }

        .nav-item {
          display:flex; align-items:center; gap:9px;
          padding:7px 10px; border-radius:8px;
          font-size:13px; color:var(--text2);
          cursor:pointer; transition:all .15s;
        }
        .nav-item:hover { background:var(--bg3); color:var(--text); }
        .nav-item.active { background:var(--gold-bg); color:var(--gold); border:1px solid var(--gold-border); }
        .nav-icon { font-size:14px; width:16px; text-align:center; flex-shrink:0; }

        .folder-group { margin-bottom:2px; }
        .folder-header {
          display:flex; align-items:center; gap:7px;
          padding:6px 10px; border-radius:7px;
          font-size:12.5px; color:var(--text2);
          cursor:pointer; transition:all .15s;
        }
        .folder-header:hover { background:var(--bg3); color:var(--text); }
        .folder-icon { font-size:10px; color:var(--text3); }
        .farrow { margin-left:auto; font-size:10px; transition:transform .2s; color:var(--text3); }
        .farrow.open { transform:rotate(-90deg); }

        .fbot {
          display:flex; align-items:center; gap:7px;
          padding:5px 10px 5px 24px; border-radius:7px;
          font-size:12px; color:var(--text2);
          cursor:pointer; transition:all .15s;
        }
        .fbot:hover { background:var(--bg3); color:var(--text); }
        .fbot.sel { background:var(--gold-bg); color:var(--gold); }
        .fbot-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .fbot-empty { font-size:11px; color:var(--text3); padding:4px 24px; }
        .sdot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .sdot.on  { background:var(--green); box-shadow:0 0 5px var(--green); }
        .sdot.off { background:var(--text3); }
        .empty-bots { font-size:11px; color:var(--text3); padding:6px 10px; }

        .sidebar-footer { margin-top:auto; padding:0.75rem; border-top:1px solid var(--border); }
        .user-row { display:flex; align-items:center; gap:8px; padding:6px 4px; }
        .uavatar-fallback {
          width:28px; height:28px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,var(--gold),var(--gold2));
          display:flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:600; color:#000;
        }
        .uinfo { flex:1; min-width:0; }
        .uname { font-size:12px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .uemail { font-size:10px; color:var(--text3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .logout-btn { font-size:13px; color:var(--text3); background:none; border:none; cursor:pointer; padding:4px; border-radius:5px; transition:color .15s; }
        .logout-btn:hover { color:var(--red); }

        .mobile-header { display:none; align-items:center; gap:12px; padding:1rem 1.25rem; background:var(--bg); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:30; }
        .hamburger { font-size:18px; background:none; border:none; color:var(--text2); cursor:pointer; }
        .mobile-logo { font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; }

        .main-content { flex:1; min-width:0; overflow-y:auto; }

        @media(max-width:768px) {
          .sidebar { position:fixed; top:0; left:0; z-index:50; transform:translateX(-100%); transition:transform .25s; height:100vh; }
          .sidebar.open { transform:translateX(0); }
          .mobile-header { display:flex; }
          .main-content { padding-top:0; }
        }
      `}</style>
    </div>
  );
}
