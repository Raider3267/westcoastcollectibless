# Production Deployment Checklist

## Pre-Deployment Requirements

### ✅ Environment Variables (Vercel Dashboard)
**Required for Production:**
- [ ] `SQUARE_ENV=production`
- [ ] `SQUARE_ACCESS_TOKEN=<production_token>`
- [ ] `SQUARE_LOCATION_ID=<production_location>`
- [ ] `NEXT_PUBLIC_SQUARE_APPLICATION_ID=<production_app_id>`
- [ ] `NEXT_PUBLIC_SQUARE_LOCATION_ID=<production_location>`
- [ ] `NEXT_PUBLIC_SITE_NAME="West Coast Collectibles"`
- [ ] `NEXT_PUBLIC_BASE_URL=https://your-production-domain.com`
- [ ] `AUTH_SECRET=<32_character_random_string>`
- [ ] `NEXTAUTH_URL=https://your-production-domain.com`
- [ ] `ADMIN_EMAILS=admin@yourdomain.com,owner@yourdomain.com`

**Optional but Recommended:**
- [ ] `RESEND_API_KEY=<production_key>`
- [ ] `RESEND_FROM_EMAIL=noreply@yourdomain.com`
- [ ] `SENTRY_DSN=<production_dsn>`
- [ ] `SENTRY_ORG=<your_org>`
- [ ] `SENTRY_PROJECT=<your_project>`
- [ ] `NEXT_PUBLIC_SENTRY_DSN=<client_dsn>`

### ✅ Domain Configuration
- [ ] Custom domain configured in Vercel
- [ ] SSL certificate active
- [ ] DNS records properly configured
- [ ] Redirect from www to non-www (or vice versa)

### ✅ Content & Data Validation
- [ ] Product data is current and accurate
- [ ] All product images uploaded and optimized
- [ ] Admin user accounts created
- [ ] Test user data cleared from production

### ✅ Security Checklist
- [ ] No development/debug content in production builds
- [ ] All API keys are production-ready (not sandbox)
- [ ] Admin emails configured correctly
- [ ] Security headers active (verified via https://securityheaders.com)
- [ ] HTTPS enforced across entire site

## Deployment Process

### 1. Code Preparation
```bash
# Ensure all tests pass locally
npm run lint
npm run build
npm run smoke

# Check for any development dependencies in production build
npm run analyze
```

### 2. Pre-deployment Testing
- [ ] All GitHub Actions CI checks passing
- [ ] Smoke tests pass locally against production build
- [ ] Performance audit completed (Lighthouse score >90)
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified

### 3. Deploy to Production
- [ ] Push to `main` branch triggers automatic deployment
- [ ] Monitor deployment logs in Vercel dashboard
- [ ] Wait for health checks to pass in GitHub Actions
- [ ] Verify deployment URL in GitHub Actions output

### 4. Post-Deployment Verification
- [ ] Run smoke tests against production URL
- [ ] Verify all critical user flows work:
  - [ ] Homepage loads correctly
  - [ ] Product listings display
  - [ ] Cart functionality works
  - [ ] Checkout process functional
  - [ ] Admin dashboard accessible
  - [ ] Authentication flows work
- [ ] Check Core Web Vitals in Chrome DevTools
- [ ] Verify analytics tracking (Vercel Analytics dashboard)
- [ ] Test error reporting (Sentry dashboard)

## Rollback Procedures

### If deployment fails health checks:
1. Check GitHub Actions logs for specific failures
2. If critical: immediately promote previous deployment in Vercel
3. Investigate and fix issues in development
4. Redeploy with fixes

### Emergency rollback steps:
1. Go to Vercel Dashboard → Project → Deployments
2. Find the last known good deployment
3. Click "..." → "Promote to Production"
4. Verify rollback with smoke tests
5. Update team and investigate issues

## Monitoring & Alerts

### Key Metrics to Monitor:
- [ ] Error rate < 1% (Sentry)
- [ ] Response time < 2s average
- [ ] Core Web Vitals scores
- [ ] Conversion funnel metrics
- [ ] API success rates

### Weekly Reviews:
- [ ] Review Vercel Analytics dashboard
- [ ] Check Sentry error trends
- [ ] Monitor Core Web Vitals in Search Console
- [ ] Review server function performance

## Performance Benchmarks

### Minimum Acceptable Performance:
- [ ] Homepage loads in < 3 seconds
- [ ] Lighthouse Performance Score > 85
- [ ] First Contentful Paint < 2s
- [ ] Cumulative Layout Shift < 0.1
- [ ] API response times < 500ms average

### Optimal Performance Targets:
- [ ] Homepage loads in < 2 seconds
- [ ] Lighthouse Performance Score > 95
- [ ] First Contentful Paint < 1.5s
- [ ] Cumulative Layout Shift < 0.05
- [ ] API response times < 200ms average

## Contact Information

**Emergency Contacts:**
- Development Team: [your-email@domain.com]
- Vercel Support: [support access info]
- Domain Registrar: [contact info]

**Service Status Pages:**
- Vercel Status: https://vercel-status.com
- Square Status: https://status.squareup.com
- Sentry Status: https://status.sentry.io

## Post-Launch Tasks

### Within 24 hours:
- [ ] Monitor error rates and performance
- [ ] Verify all integrations working
- [ ] Check analytics data flowing
- [ ] Test backup procedures

### Within 1 week:
- [ ] Review user feedback and bug reports
- [ ] Analyze performance metrics trends
- [ ] Schedule regular backup verification
- [ ] Document any issues encountered

---

**Last Updated:** $(date)
**Deployment Environment:** Production
**Responsible Team:** Development Team