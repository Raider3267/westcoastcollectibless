// This file configures the initialization of Sentry on the server side
// The config you add here will be used whenever the server handles a request
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error filtering and enhancement
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    const error = hint.originalException;
    
    // Add additional context for API errors
    if (event.request?.url) {
      const url = event.request.url;
      
      // Tag API vs page errors
      if (url.includes('/api/')) {
        event.tags = { ...event.tags, type: 'api_error' };
      } else {
        event.tags = { ...event.tags, type: 'page_error' };
      }
      
      // Add route context
      if (url.includes('/admin/')) {
        event.tags = { ...event.tags, area: 'admin' };
      } else if (url.includes('/api/admin/')) {
        event.tags = { ...event.tags, area: 'admin_api' };
      }
    }
    
    // Enhanced error context for database errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      if (prismaError.code?.startsWith('P')) {
        event.tags = { ...event.tags, database: 'prisma' };
        event.extra = { 
          ...event.extra, 
          prismaCode: prismaError.code,
          prismaMessage: prismaError.message
        };
      }
    }
    
    // Enhanced context for Square API errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      event.tags = { ...event.tags, integration: 'square' };
    }
    
    return event;
  },
  
  // Environment and release tracking
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Additional context
  initialScope: {
    tags: {
      component: "server",
    },
  },
  
  // Custom integrations
  integrations: [
    // Add custom integrations here if needed
  ],
});