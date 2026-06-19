# Supabase Setup — Finmora Backend

## 1. Create Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Choose region (e.g. **South Asia Mumbai**)
3. Set a strong **database password** (save it)

## 2. Connection strings

In **Project Settings → Database → Connection string**:

| Variable | Use |
|----------|-----|
| `DATABASE_URL` | **Transaction pooler** (port 6543) — app runtime |
| `DIRECT_URL` | **Direct** (port 5432) — Prisma migrations |

Copy both into `.env` (see `.env.example`).

## 3. Auth secret

```powershell
# PowerShell — random AUTH_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Add to `.env` as `AUTH_SECRET`.

## 4. KYC storage bucket (optional)

1. **Storage → New bucket** → name: `kyc` → **Private**
2. **Project Settings → API** → copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose to client)

## 5. Connect & seed

```bash
cp .env.example .env
# Edit .env with your Supabase values

npm run db:setup
npm run dev
```

`db:setup` runs: `prisma generate` → `migrate deploy` → `seed`

## 6. Default seeded accounts

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@finmora.in   | Admin@123 |
| User  | rahul@email.com    | User@123  |

Signup referral codes: `FM-ADMIN0` or `FM-A8K2M9`

## Troubleshooting

- **Migration fails with pooler**: ensure `DIRECT_URL` is set (direct connection, not pooler).
- **P1001 can't reach database**: check password and project ref in URLs.
- **KYC upload**: create `kyc` bucket; without Supabase keys, uploads work in mock mode (DB record only).

## 7. Razorpay (investments)

1. Create a [Razorpay test account](https://dashboard.razorpay.com/)
2. Copy **Key ID** and **Key Secret** into `.env`
3. Set webhook URL (production or ngrok for local):
   - `https://your-domain/api/payments/webhook`
   - Event: `payment.captured`
   - Secret → `RAZORPAY_WEBHOOK_SECRET`

Local dev without webhook: checkout success calls `/api/payments/verify` automatically.

Test card: `4111 1111 1111 1111`, any future expiry, any CVV.

## 8. ROI cron (optional)

Daily credit for due investments:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/roi-credit
```
