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
