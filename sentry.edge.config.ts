// This file configures the initialization of Sentry for edge-side rendering of pages
// The config you add here will be used whenever a page is rendered at the edge
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring (lower sample rate for edge due to volume)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  
  // Simplified error handling for edge runtime
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Tag as edge runtime
    event.tags = { ...event.tags, runtime: 'edge' };
    
    return event;
  },
  
  // Environment context
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Minimal scope for edge
  initialScope: {
    tags: {
      component: "edge",
    },
  },
});