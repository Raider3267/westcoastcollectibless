# Build Requirements and Package Management

This project uses **pnpm** as the package manager and requires specific Node.js versions for consistent builds across all environments.

## Requirements

### Node.js Version
- **Required:** Node.js 18.x - 20.x
- **Recommended:** Node.js 20.x (as specified in `.nvmrc`)
- **Not supported:** Node.js 16.x and below, Node.js 21.x and above

### Package Manager
- **Required:** pnpm v8
- **Forbidden:** npm, yarn, or other package managers

## Setup Instructions

### 1. Node.js Installation
```bash
# Using nvm (recommended)
nvm use  # This reads from .nvmrc automatically

# Or install Node 20 directly
nvm install 20
nvm use 20
```

### 2. pnpm Installation
```bash
# Install pnpm globally
npm install -g pnpm@8

# Verify installation
pnpm --version  # Should show 8.x.x
```

### 3. Project Setup
```bash
# Install dependencies (uses frozen lockfile)
pnpm install --frozen-lockfile

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Important Notes

### Package Manager Enforcement
- The project has `engine-strict=true` in `.npmrc` to enforce Node.js version requirements
- The `packageManager` field in `package.json` specifies `pnpm@8`
- CI will fail if conflicting lockfiles (package-lock.json, yarn.lock) are present

### Lockfile Management
- **Always use:** `pnpm-lock.yaml` (committed to git)
- **Never commit:** `package-lock.json`, `yarn.lock`, or `npm-shrinkwrap.json`
- Run `node scripts/cleanup-package-managers.mjs` if you accidentally create conflicting lockfiles

### Common Commands
```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production  
pnpm start                  # Start production server

# Database (Prisma)
pnpm db:generate           # Generate Prisma client
pnpm db:push               # Push schema to database
pnpm db:migrate            # Run database migrations

# Utilities
pnpm perf-check           # Performance analysis
pnpm smoke                # Smoke tests
```

## Vercel Deployment

The project is configured for Vercel with:
- `buildCommand: "pnpm build"`
- `installCommand: "pnpm install --frozen-lockfile"`
- `framework: "nextjs"`

## Troubleshooting

### Build Fails with Node Version Error
```bash
# Check your Node version
node --version

# Switch to correct version
nvm use 20
```

### pnpm Command Not Found
```bash
# Install pnpm globally
npm install -g pnpm@8

# Or use npx (temporary)
npx pnpm@8 install
```

### Conflicting Lockfiles
```bash
# Run cleanup script
node scripts/cleanup-package-managers.mjs

# Then reinstall
pnpm install --frozen-lockfile
```

### CI Failures
- Ensure no `package-lock.json` or `yarn.lock` files exist
- Verify `packageManager` field in `package.json` is set to `pnpm@8`
- Check that `.nvmrc` contains the correct Node version
- Confirm `pnpm-lock.yaml` is committed and up to date

## Development Workflow

1. **Before starting work:** Ensure correct Node version with `nvm use`
2. **Installing packages:** Always use `pnpm add <package>` or `pnpm add -D <package>`
3. **Running scripts:** Use `pnpm run <script>` instead of `npm run <script>`
4. **Before committing:** Run cleanup script to remove any conflicting lockfiles

## Why pnpm?

- **Faster installs:** Efficient storage with hard links and content-addressable storage
- **Strict isolation:** Better dependency resolution and no phantom dependencies
- **Vercel compatibility:** Native support for pnpm in Vercel deployments
- **Monorepo ready:** Better support for workspace management if needed in the future