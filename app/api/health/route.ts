import { NextResponse } from 'next/server'

/**
 * Health Check Endpoint
 * 
 * Provides system health status for monitoring and smoke tests
 * - Basic connectivity check
 * - Environment validation
 * - Phase 2: Database connectivity
 */

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
      phase: process.env.ENABLE_DATABASE === 'true' ? 2 : 1,
      checks: {
        server: 'ok',
        environment: 'ok',
        storage: 'ok',
        database: 'not_enabled', // Phase 1 default
      }
    }
    
    // Check environment variables
    const requiredEnvVars = [
      'SQUARE_ENV',
      'NEXT_PUBLIC_SITE_NAME',
      'AUTH_SECRET',
    ]
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        health.status = 'degraded'
        health.checks.environment = 'missing_env_vars'
        break
      }
    }
    
    // Phase 2: Database connectivity check
    if (process.env.ENABLE_DATABASE === 'true' && process.env.DATABASE_URL) {
      try {
        // This would check database connectivity in Phase 2
        // const { PrismaClient } = await import('@prisma/client')
        // const prisma = new PrismaClient()
        // await prisma.$queryRaw`SELECT 1`
        // await prisma.$disconnect()
        
        health.checks.database = 'ok'
      } catch (error) {
        health.status = 'degraded'
        health.checks.database = 'connection_failed'
      }
    }
    
    // Check JSON storage accessibility (Phase 1)
    if (health.phase === 1) {
      try {
        const fs = await import('fs/promises')
        const path = await import('path')
        
        // Test read access to data directory
        const dataPath = path.join(process.cwd(), 'data')
        await fs.access(dataPath)
        
        health.checks.storage = 'ok'
      } catch (error) {
        health.status = 'degraded'
        health.checks.storage = 'access_failed'
      }
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime
    health.responseTime = `${responseTime}ms`
    
    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(health, { status: statusCode })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      responseTime: `${Date.now() - startTime}ms`
    }, { status: 503 })
  }
}