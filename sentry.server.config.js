// sentry.server.config.js
import * as Sentry from '@sentry/nextjs';
Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate:1.0 });

// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';
Sentry.init({ dsn: process.env.SENTRY_DSN });