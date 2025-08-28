// This file configures the initialization of Sentry on the browser side
// The config you add here will be used whenever a page is visited
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay - disabled for now (requires higher Sentry plan)
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1.0,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out localhost errors in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Filter out known non-critical errors
    const error = hint.originalException;
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message as string;
      
      // Skip common browser extension errors
      if (message.includes('Non-Error exception captured')) {
        return null;
      }
      
      // Skip network errors that are user-related
      if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Environment context
  environment: process.env.NODE_ENV,
  
  // Additional context
  initialScope: {
    tags: {
      component: "client",
    },
  },
  
  integrations: [
    // Session replay integration disabled for now
    // new Sentry.Replay({
    //   maskAllText: true,
    //   blockAllMedia: true,
    // }),
  ],
});