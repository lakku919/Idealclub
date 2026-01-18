```markdown
# idealclub — Demo lottery platform (Ready-to-deploy)

This repository is a ready-to-deploy demo of a lottery/wallet/admin platform named "idealclub". It is intended for demo/testing only. Real-money payouts must NOT be enabled until you complete legal licensing and Stripe verification.

What you get:
- Next.js frontend + API routes
- SQLite + Prisma for database (easy demo)
- Auth (email/password), seeded admin: `admin@idealclub.test` / `TempPass123!`
- Wallet + transaction ledger, deposit endpoint (Stripe test or simulated), buy tickets, withdrawal requests
- Admin dashboard to approve/mark paid withdrawal requests and run lottery draws
- Stripe webhook endpoint for `payment_intent.succeeded` to credit wallets in test mode

Quick setup (local)

1. Install
   - Node 18+
   - git

2. Copy env
   ```
   cp .env.example .env
   # edit .env and set SESSION_PASSWORD to a long secret
   ```

3. Install deps
   ```
   npm install
   ```

4. Generate Prisma client & migrate
   ```
   npx prisma generate
   npx prisma migrate dev --name init
   node prisma/seed.js
   ```

5. Start dev
   ```
   npm run dev
   ```
   Open http://localhost:3000. Sign in as `admin@idealclub.test` / `TempPass123!`

How to deploy to Vercel (fast & recommended)
1. Create a GitHub repo and push this project
   ```
   git init
   git add .
   git commit -m "Initial idealclub demo"
   # create a repo on GitHub, then:
   git remote add origin https://github.com/<your-username>/idealclub.git
   git branch -M main
   git push -u origin main
   ```

2. Create a Vercel account (https://vercel.com) and Import Project → select your GitHub repo.

3. Add Environment Variables in Vercel (Dashboard → Settings → Environment Variables):
   - DATABASE_URL = file:./dev.db
   - SESSION_PASSWORD = <a long secret>
   - NEXT_PUBLIC_APP_URL = https://<your-vercel-url>
   - STRIPE_SECRET_KEY = (optional for test; leave blank to use simulated deposits)
   - STRIPE_PUBLISHABLE_KEY = (optional)
   - STRIPE_WEBHOOK_SECRET = (optional, only if you configure webhooks)

   Note: For demo using SQLite, the file-based DB will be created in the project root on Vercel during build — for persistence across instances use a managed Postgres (Supabase / Neon) and update DATABASE_URL.

4. After deploy, run the seed:
   - Vercel does not allow running interactive scripts; easiest: visit `<your-deploy-url>/api/seed` once (only in non-production allowed). If you set NODE_ENV=production in Vercel, the endpoint will be blocked; instead run the seed script locally, push the generated dev.db to the repo for demo (not for production). Alternatively, switch to a managed Postgres and run the Prisma migrate & seed there.

Stripe test mode setup (optional but recommended for Stripe flows)
1. Create a Stripe account (https://dashboard.stripe.com/register)
2. In Dashboard → Developers → API keys, copy TEST keys:
   - STRIPE_SECRET_KEY (starts with sk_test_)
   - STRIPE_PUBLISHABLE_KEY (pk_test_)
3. Add keys as Vercel environment variables.
4. Configure webhooks: add an endpoint `https://<your-deploy-url>/api/stripe-webhook` and provide the webhook secret to STRIPE_WEBHOOK_SECRET in Vercel.
5. Use Stripe test card numbers to simulate payments. When `payment_intent.succeeded` events arrive, the webhook will credit the user's wallet automatically.

Important notes & next steps for real payouts
- DO NOT enable live payouts or live API keys until:
  - You have the necessary gambling/lottery license in the jurisdictions you will operate in.
  - You have discussed your use case with Stripe and obtained approval (Stripe may limit or reject gambling activity).
  - You have implemented KYC/AML checks and any age verification required by law.
- For production:
  - Use Postgres (Supabase/Neon/etc.) — update `DATABASE_URL`.
  - Move secrets to environment variable storage (Vercel secrets).
  - Integrate Stripe Connect (Express or Custom) for real payouts to users. Use Stripe-hosted onboarding for collecting bank info.
  - Add robust logging, rate limiting, and backups.
  - Consider legal counsel.

If you want, I will:
- Walk you step-by-step (click-by-click) to create a GitHub repo and deploy on Vercel and then give you the live URL.
- Or, if you give me your GitHub username, I will provide the exact git push commands to use.

Security reminder: never share secret keys, bank details, or passwords in chat. Add them securely in Vercel / Stripe dashboards.
```
