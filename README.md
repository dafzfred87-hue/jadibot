# 🤖 Jadibot — Dafz Hosting Bot Panel

Panel manajemen bot WhatsApp berbasis Pterodactyl. Login Google, deploy bot, monitor realtime, kontrol penuh dari satu dashboard.

---

## ✨ Fitur

- 🔐 **Login Google** — autentikasi OAuth, aman dan cepat
- 🤖 **Bot Management** — tambah, hapus, start/stop/restart bot WA
- 📊 **Live Monitor** — CPU, RAM, Disk realtime tiap 5 detik
- 👑 **Owner Panel** — khusus `dafzfred87@gmail.com` & `wanzzganzz095@gmail.com`
- 👥 **User Tracking** — lihat semua akun yang pernah login
- 🔧 **Maintenance Mode** — blokir user saat pemeliharaan, owner tetap masuk
- 🛡️ **Firewall** — blokir email atau IP tertentu
- 🏪 **Dafz Store** — info layanan hosting & produk digital

---

## 🛠 Stack

- **Next.js 14** — framework
- **NextAuth.js** — Google OAuth
- **Pterodactyl API** — manajemen server bot
- **Vercel** — hosting & deployment

---

## 🚀 Deploy ke Vercel

### 1. Push ke GitHub

```bash
cd /storage/emulated/0/Download/JadibotFile/jadibot
git add .
git commit -m "update"
git push
```

### 2. Environment Variables di Vercel

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | dari Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | dari Google Cloud Console |
| `NEXTAUTH_SECRET` | random string panjang |
| `NEXTAUTH_URL` | `https://jadibot-xi.vercel.app` |
| `PTERODACTYL_URL` | URL panel pterodactyl kamu |
| `PTERODACTYL_API_KEY` | Application API key (`ptla_xxx`) |
| `PTERODACTYL_CLIENT_KEY` | Client API key (`ptlc_xxx`) |
| `PTERO_NEST_ID` | Nest ID di panel |
| `PTERO_EGG_ID` | Egg ID di panel |
| `PTERO_STARTUP` | `node index.js` |
| `PTERO_DOCKER_IMAGE` | `ghcr.io/pterodactyl/yolks:nodejs_18` |

---

## 👑 Owner Access

Owner memiliki akses penuh ke:
- Daftar semua user yang login
- Maintenance mode on/off
- Firewall (blokir email / IP)

Owner terdaftar: `dafzfred87@gmail.com`, `wanzzganzz095@gmail.com`

---

## 📁 Struktur Project

```
jadibot/
├── pages/
│   ├── index.js          # Landing page
│   ├── dashboard.js      # Dashboard utama
│   ├── add-bot.js        # Tambah bot baru
│   ├── sessions.js       # Semua sesi
│   ├── bot/[id].js       # Detail bot
│   └── admin/
│       ├── users.js      # Daftar user (owner only)
│       ├── maintenance.js # Maintenance mode (owner only)
│       └── firewall.js   # Firewall (owner only)
├── components/
│   ├── Layout.js         # Sidebar + layout
│   └── MaintenanceGate.js # Gate maintenance
├── lib/
│   ├── pterodactyl.js    # Pterodactyl API client
│   ├── owners.js         # Daftar owner
│   └── storage.js        # Penyimpanan data
└── styles/
    └── globals.css       # Global styles
```

---

© 2026 **Dafz Hosting** · All rights reserved
