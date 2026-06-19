# Vercel Production Deploy — Finmora

Deploy the Next.js app from [github.com/drezor1/finmora](https://github.com/drezor1/finmora) to Vercel with Supabase, Auth.js, Razorpay (test), and cron jobs.

## 1. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in.
2. **Import** the `drezor1/finmora` repository.
3. Framework: **Next.js** (auto-detected).
4. Root directory: `./` (default).
5. Do **not** deploy yet — add environment variables first (step 2).

## 2. Environment variables (Production)

Add these in **Project → Settings → Environment Variables** for **Production**:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Supabase **transaction pooler** (port 6543). See [supabase-setup.md](./supabase-setup.md). |
| `DIRECT_URL` | Yes | Supabase **direct** connection (port 5432) for Prisma. |
| `AUTH_SECRET` | Yes | Random 32+ char secret (same as local or generate new). |
| `AUTH_URL` | Yes | Your live URL, e.g. `https://finmora.vercel.app` (no trailing slash). |
| `NEXT_PUBLIC_RAZORPAY_MODE` | Yes | `test` for test payments. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | `rzp_test_...` |
| `RAZORPAY_KEY_ID` | Yes | Same test key ID. |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay test secret. |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | From Razorpay webhook setup (step 4). |
| `CRON_SECRET` | Yes | Random secret; Vercel cron sends it as `Authorization: Bearer ...`. |
| `RESEND_API_KEY` | No | Without it, emails log to server console only. |
| `EMAIL_FROM` | No | e.g. `Finmora <onboarding@resend.dev>` |
| `SUPABASE_URL` | No | Required for KYC file uploads to Supabase Storage. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only; never expose to client. |
| `SUPABASE_KYC_BUCKET` | No | Default: `kyc` |

Do **not** set `EXPO_PUBLIC_API_URL` on Vercel (mobile app only).

## 3. Deploy

Click **Deploy**. Build runs:

- `npm install` → `postinstall` (`prisma generate`) → `next build`

Cron schedules are defined in [`vercel.json`](../vercel.json):

- `/api/cron/roi-credit` — daily at 02:00 UTC
- `/api/cron/notifications-dispatch` — every 15 minutes

## 4. Database migrations (one-time)

From your PC with production `DIRECT_URL` in `.env`:

```powershell
cd E:\wealthplus
npx prisma migrate deploy
```

Optional seed (empty DB only):

```powershell
npm run db:seed
```

Default admin: `admin@finmora.in` / `Admin@123` (change password after first login).

## 5. Razorpay webhook

After deploy, note your Vercel URL (e.g. `https://finmora-xxx.vercel.app`).

In [Razorpay Dashboard](https://dashboard.razorpay.com/) → **Webhooks**:

- **URL:** `https://YOUR-VERCEL-URL/api/payments/webhook`
- **Secret:** copy into Vercel `RAZORPAY_WEBHOOK_SECRET`
- Enable events used by the app (`payment.captured`, etc.)

Redeploy if you change webhook secret after first deploy.

Update `AUTH_URL` in Vercel if the final URL differs from what you set initially.

## 6. Smoke tests

| Check | URL / action |
|-------|----------------|
| Landing | `/en` |
| User login | `/en/login` — seed: `rahul@email.com` / `User@123` |
| Admin | `/en/admin/login` — `admin@finmora.in` / `Admin@123` |
| Invest | Dashboard → Invest Now → Razorpay test checkout |
| Cron (manual) | `GET /api/cron/roi-credit` with header `Authorization: Bearer YOUR_CRON_SECRET` |

## 7. Custom domain (later)

Vercel → **Project → Settings → Domains** → add e.g. `finmora.in`, then update:

- `AUTH_URL` to `https://finmora.in`
- Razorpay webhook URL to the new domain

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Prisma | Ensure `postinstall` runs; check `DATABASE_URL` is set for generate (schema only needs env at runtime for queries). |
| Login redirects wrong | `AUTH_URL` must match exact production URL. |
| Webhook 401/500 | Verify `RAZORPAY_WEBHOOK_SECRET` matches Razorpay dashboard. |
| Cron 401 | Set `CRON_SECRET` in Vercel env; redeploy. |
