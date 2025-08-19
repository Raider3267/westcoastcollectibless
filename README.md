# West Coast Collectibles

Repository:
- Remote: https://github.com/Raider3267/westcoastcollectibless (branch: main)

Source of truth:
- The local workspace root is the source of truth. Changes here are committed and pushed to origin/main.

Git hooks:
- Hooks directory: .githooks/
- Auto-push post-commit hook is opt-in for safety.
  - Enable temporarily via environment: export GIT_ENABLE_AUTO_PUSH=1
  - Enable persistently per-repo: git config autopush.enabled true
  - Optional safety guard (recommended): lock pushes to the intended remote
    - Set once: git config autopush.repo github.com/Raider3267/westcoastcollectibless.git
  - Disable at any time (takes precedence): export GIT_DISABLE_AUTO_PUSH=1

Standard workflow:
1) Sync before work:
   git pull --rebase origin main
2) Make changes and stage them:
   git add -A
3) Commit with a plain-English summary, e.g.:
   git commit -m "Tweak product grid spacing and update homepage hero copy"
4) Push:
   - If auto-push is enabled, the hook will push after each commit.
   - Otherwise, push manually:
     git push

First-time authentication:
- When pushing over HTTPS, Git will prompt for GitHub username and a Personal Access Token (PAT) with repo scope. Use the PAT in place of a password.

Ignore patterns:
- The repository ignores common Node/Next.js artifacts, the nested duplicate directory `westcoastcollectibless/`, and eBay CSV exports:
  - eBay-all-active-listings-report-*.csv

Notes:
- Commit messages should be concise and descriptive in plain English.
- Prefer rebase pulls (git pull --rebase) to maintain a linear history.

## Square Checkout Integration

### Setup
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Square credentials:
   - `SQUARE_ENV=sandbox` (or `production`)
   - `SQUARE_ACCESS_TOKEN=your_access_token`
   - `SQUARE_LOCATION_ID=your_location_id` 
   - `NEXT_PUBLIC_SQUARE_APPLICATION_ID=your_app_id`

### Development
```bash
npm install
npm run dev
```

### Testing Square Checkout
1. Visit `/sandbox-buy` for a test checkout page
2. Click "Buy Now with Square" → redirected to Square hosted checkout
3. Complete payment using test card: `4111 1111 1111 1111`
   - Any future expiry date (e.g., 12/25)
   - Any CVV (e.g., 123)
   - Any ZIP code (e.g., 12345)
4. Should redirect to `/success` page after completion

### Production Mode
- Set `SQUARE_ENV=production` in `.env.local`
- Use your Production Access Token, Location ID, and Application ID
- **Warning**: Production mode processes real payments
