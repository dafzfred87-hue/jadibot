import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { isOwner } from "../../lib/owners";
import Image from "next/image";

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
    if (status === "authenticated" && !isOwner(session?.user?.email)) router.replace("/dashboard");
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && isOwner(session?.user?.email))
      fetch("/api/admin?type=users").then(r=>r.json()).then(d=>setUsers(Array.isArray(d)?d:[]));
  }, [status, session]);

  return (
    <Layout bots={[]}>
      <div className="page">
        <button className="back" onClick={() => router.push("/dashboard")}>‹ Dashboard</button>
        <div className="ph"><h1>👥 Daftar Users</h1><p>Semua akun yang pernah login ke Jadibot</p></div>

        <div className="tw">
          <div className="tt">
            <span>Total: {users.length} user</span>
          </div>
          {users.length === 0 ? <div className="empty">Belum ada user yang login</div> : (
            <table className="tbl">
              <thead><tr><th>User</th><th>Email</th><th>Login Terakhir</th><th>Total Login</th></tr></thead>
              <tbody>
                {users.sort((a,b) => new Date(b.lastLogin) - new Date(a.lastLogin)).map(u => (
                  <tr key={u.email}>
                    <td>
                      <div className="urow">
                        {u.image ? <img src={u.image} width={28} height={28} style={{borderRadius:"50%"}} /> : <div className="uav">{u.name?.charAt(0)}</div>}
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td className="mono">{u.email}</td>
                    <td className="dim">{new Date(u.lastLogin).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                    <td><span className="cnt">{u.loginCount}x</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style jsx>{`
        .page{padding:2rem;max-width:900px}
        .back{display:flex;align-items:center;gap:6px;font-size:13px;color:#555;background:none;border:none;cursor:pointer;padding:0;margin-bottom:1.5rem;transition:color .15s}
        .back:hover{color:#fff}
        .ph{margin-bottom:1.75rem}
        .ph h1{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:4px}
        .ph p{font-size:13px;color:#555}
        .tw{background:#0e0e0e;border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden}
        .tt{padding:1rem 1.25rem;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:#555}
        .tbl{width:100%;border-collapse:collapse}
        .tbl th{text-align:left;font-size:11px;font-weight:500;color:#333;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.05);text-transform:uppercase;letter-spacing:.06em}
        .tbl td{font-size:13px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);vertical-align:middle;color:#ccc}
        .tbl tr:last-child td{border-bottom:none}
        .tbl tr:hover td{background:rgba(255,255,255,.02)}
        .urow{display:flex;align-items:center;gap:8px}
        .uav{width:28px;height:28px;border-radius:50%;background:rgba(245,200,66,0.1);border:1px solid rgba(245,200,66,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;color:#f5c842;flex-shrink:0}
        .mono{font-family:monospace;font-size:12px;color:#555}
        .dim{font-size:12px;color:#444}
        .cnt{font-size:12px;padding:2px 8px;border-radius:5px;background:rgba(245,200,66,0.08);color:#f5c842;border:1px solid rgba(245,200,66,0.15)}
        .empty{padding:3rem;text-align:center;color:#444;font-size:14px}
      `}</style>
    </Layout>
  );
}
