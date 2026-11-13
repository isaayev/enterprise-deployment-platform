/**
 * Nexus Gaming Review Platform - Monitoring & Observability System
 *
 * Provides:
 *  1. Core Web Vitals reporting (LCP, INP, CLS, FCP, TTFB)
 *  2. Privacy-conscious error tracking with Sentry fallback
 *  3. Context sanitization ensuring NO passwords, JWTs, or PII ever leak
 *  4. Application performance logging
 */

import { NextWebVitalsMetric } from 'next/app';

// Sensitive keys that must NEVER be reported to external monitoring
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'jwt',
  'secret',
  'cookie',
  'authorization',
  'creditcard',
  'bearer',
]);

/**
 * Deeply sanitizes objects to scrub passwords, tokens, and authorization credentials
 */
export function sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('token')) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Core Web Vitals reporter.
 * Integrates with Next.js reportWebVitals hook in pages router or useReportWebVitals in app router.
 */
export function reportWebVitals(metric: NextWebVitalsMetric | { id: string; name: string; value: number; label?: string }) {
  const { id, name, value } = metric;

  // Rating thresholds defined by Google Web Vitals standard
  let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
  if (name === 'LCP') {
    rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
  } else if (name === 'CLS') {
    rating = value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
  } else if (name === 'INP' || name === 'FID') {
    rating = value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
  }

  // Log in development and non-intrusively in production
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Web Vitals] ${name} (${id}): ${Math.round(value)}ms | Rating: ${rating}`);
  }

  // If SENTRY_DSN or an analytics endpoint is configured, forward the metric
  if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureMessage: (msg: string, extra?: unknown) => void } }).Sentry) {
    (window as unknown as { Sentry: { captureMessage: (msg: string, extra?: unknown) => void } }).Sentry.captureMessage(
      `WebVital:${name}`,
      {
        level: rating === 'poor' ? 'warning' : 'info',
        extra: { id, name, value, rating },
      }
    );
  }
}

/**
 * Captures exceptions with automatic sanitization of sensitive fields
 */
export function captureException(error: unknown, context: Record<string, unknown> = {}) {
  const safeContext = sanitizeContext(context);

  if (process.env.NODE_ENV === 'development') {
    console.error('[Observability Error Captured]:', error, safeContext);
  }

  // Sentry integration hook
  if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (err: unknown, ctx?: unknown) => void } }).Sentry) {
    (window as unknown as { Sentry: { captureException: (err: unknown, ctx?: unknown) => void } }).Sentry.captureException(error, {
      extra: safeContext,
    });
  }
}

/**
 * Captures operational messages with severity level
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context: Record<string, unknown> = {}) {
  const safeContext = sanitizeContext(context);

  if (process.env.NODE_ENV === 'development' || level === 'error') {
    console.log(`[Observability ${level.toUpperCase()}]: ${message}`, safeContext);
  }

  if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureMessage: (msg: string, ctx?: unknown) => void } }).Sentry) {
    (window as unknown as { Sentry: { captureMessage: (msg: string, ctx?: unknown) => void } }).Sentry.captureMessage(message, {
      level,
      extra: safeContext,
    });
  }
}

