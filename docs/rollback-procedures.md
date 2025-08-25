# Rollback & Incident Response Procedures

## Emergency Contacts & Quick Actions

### 🚨 Immediate Response (< 5 minutes)
If production is down or critical functionality is broken:

1. **Assess Impact**: Check health endpoint: `curl https://your-domain.com/api/health`
2. **Quick Rollback**: Go to [Vercel Dashboard](https://vercel.com/dashboard) → Project → Deployments
3. **Promote Previous**: Find last known good deployment → "..." → "Promote to Production"
4. **Verify Fix**: Run smoke tests: `DEPLOYMENT_URL=https://your-domain.com npm run smoke`
5. **Notify Team**: Post in team channels with status

### 📞 Emergency Contacts
- **Primary On-Call**: [Your Phone/Email]
- **Backup On-Call**: [Backup Contact]
- **Vercel Support**: support@vercel.com (Pro plans)
- **Square Support**: 1-855-700-6000

## Rollback Procedures by Platform

### Vercel Production Rollback

#### Method 1: Dashboard (Fastest)
1. Go to https://vercel.com/[username]/westcoastcollectibless
2. Click "Deployments" tab
3. Find the last stable deployment (green checkmark + passed tests)
4. Click "..." → "Promote to Production"
5. Wait 30 seconds for propagation
6. Verify with: `curl -I https://your-domain.com`

#### Method 2: CLI (If Dashboard unavailable)
```bash
# Install Vercel CLI if not present
npm i -g vercel

# Login and switch to project
vercel login
vercel switch westcoastcollectibless

# List recent deployments
vercel ls

# Promote a specific deployment
vercel promote [deployment-url] --scope=[your-username]
```

#### Method 3: GitHub Actions (Re-deploy known good)
1. Go to GitHub → Actions → "Deploy to Vercel"
2. Find the last successful workflow run
3. Click "Re-run all jobs"
4. Monitor deployment in Actions tab

### Database Rollback (Phase 2 - Future)
When using PostgreSQL database:

```bash
# Connect to database
psql $DATABASE_URL

# Check recent migrations
SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;

# Rollback to specific migration (if needed)
npx prisma migrate resolve --rolled-back [migration_name]
```

## Incident Severity Levels

### 🔴 P0 - Critical (Immediate Response)
- Site completely down
- Payment processing broken
- Data corruption/loss
- Security breach

**Response Time**: < 5 minutes
**Actions**: Immediate rollback, emergency notification

### 🟠 P1 - High (1 hour response)
- Major feature broken
- Performance degradation >50%
- Admin panel inaccessible
- Authentication issues

**Response Time**: < 1 hour
**Actions**: Investigate, rollback if needed within 2 hours

### 🟡 P2 - Medium (4 hour response)
- Minor feature broken
- Visual/UI issues
- Non-critical API endpoints down
- Performance issues <25% degradation

**Response Time**: < 4 hours
**Actions**: Fix in next deployment cycle

### 🟢 P3 - Low (Next business day)
- Cosmetic issues
- Documentation updates needed
- Minor UX improvements

**Response Time**: Next business day
**Actions**: Schedule in regular development cycle

## Health Check Protocols

### Automated Monitoring
- **GitHub Actions**: Runs smoke tests on every deployment
- **Vercel**: Built-in uptime monitoring
- **Health Endpoint**: `/api/health` returns status + response time

### Manual Health Checks
```bash
# Quick site health check
curl -w "Response: %{http_code}, Time: %{time_total}s\n" -s -o /dev/null https://your-domain.com

# Comprehensive smoke test
DEPLOYMENT_URL=https://your-domain.com npm run smoke

# Check specific functionality
curl https://your-domain.com/api/products | jq '.[] | .title' | head -3
```

### Key Metrics to Monitor
- **Response Time**: < 2s average
- **Error Rate**: < 1%
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **API Success Rate**: > 99%

## Common Issues & Solutions

### Issue: Deployment Stuck/Failed
**Symptoms**: Deployment shows "Building" for >10 minutes
**Solution**: 
1. Cancel deployment in Vercel dashboard
2. Check build logs for errors
3. If persistent, redeploy with clean cache

### Issue: Environment Variables Not Loading
**Symptoms**: 503 errors, "missing env vars" in health check
**Solution**:
1. Verify env vars in Vercel dashboard
2. Ensure production/preview environments configured separately
3. Redeploy to pick up changes

### Issue: Static Assets Not Loading
**Symptoms**: Images/CSS missing, console errors
**Solution**:
1. Check Vercel functions logs
2. Verify file paths and permissions
3. Check CDN cache status
4. Consider manual cache purge

### Issue: Database Connection Issues (Phase 2)
**Symptoms**: API timeouts, connection refused errors
**Solution**:
1. Check database provider status
2. Verify connection string
3. Check connection pool limits
4. Restart database connections

## Post-Incident Procedures

### Immediate (Within 1 hour)
- [ ] Confirm issue resolved and site stable
- [ ] Document timeline and actions taken
- [ ] Notify stakeholders of resolution
- [ ] Update monitoring/alerts if needed

### Short-term (Within 24 hours)
- [ ] Root cause analysis
- [ ] Update runbooks with lessons learned
- [ ] Review monitoring gaps
- [ ] Schedule fixes for underlying issues

### Long-term (Within 1 week)
- [ ] Post-mortem meeting with team
- [ ] Process improvements
- [ ] Preventive measures implementation
- [ ] Update documentation

## Testing Rollback Procedures

### Monthly Rollback Drill
```bash
# 1. Deploy a test change to preview
git checkout -b test-rollback-drill
echo "// Test change" >> app/page.tsx
git commit -am "test: rollback drill"
git push origin test-rollback-drill

# 2. Create PR and deploy to preview
# 3. Practice promoting previous production deployment
# 4. Verify rollback successful
# 5. Clean up test branch
```

### Quarterly Disaster Recovery Test
- Practice complete environment recreation
- Test backup restoration procedures
- Verify all emergency contacts work
- Update procedures based on findings

## Useful Commands Reference

```bash
# Check deployment status
vercel ls --scope=[your-username]

# Get current deployment info
vercel inspect [deployment-url]

# Stream deployment logs
vercel logs [deployment-url] --follow

# Force cache purge
curl -X PURGE https://your-domain.com/

# Check DNS propagation
dig your-domain.com
nslookup your-domain.com

# Test from different regions
curl -H "CF-IPCountry: JP" https://your-domain.com  # Simulate Japan
curl -H "CF-IPCountry: EU" https://your-domain.com  # Simulate Europe
```

---

**Document Version**: 1.0
**Last Updated**: $(date)
**Review Schedule**: Monthly
**Owner**: Development Team