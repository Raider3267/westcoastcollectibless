# West Coast Collectibles

Workflow:
- Local workspace root is the source of truth.
- Commit with a plain-English summary of what changed.
- Post-commit hook auto-pushes the current branch once an upstream is set.
  - To temporarily skip auto-push: set environment variable GIT_DISABLE_AUTO_PUSH=1.
- First push will prompt for HTTPS credentials (GitHub username + PAT with repo scope).

