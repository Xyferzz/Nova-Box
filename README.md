# Nova-Box — Deployment & Env

Perubahan ini hanya menyentuh bagian server (api/) untuk memperbaiki runtime compatibility.

Environment variables (set di Vercel dashboard):
- SUPABASE_URL
- SUPABASE_ANON_KEY
- API_KEY

Supabase DB requirements:
- Table `files` with columns at least: code (text), url (text), filename (text), type (text)
- Table `api_keys` with columns at least: email (text), api_key (text)

Local testing:
- Instal dependencies: `npm install`
- Install Vercel CLI (opsional): `npm i -g vercel`
- Jalankan: `vercel dev` (butuh akun Vercel) atau deploy ke Vercel.

Catatan keamanan:
- Saat ini ada Supabase anon keys di kode client; sebaiknya ganti jika ini sensitif. Saya tidak mengubah UI/CSS atau client-side key tanpa izin.
