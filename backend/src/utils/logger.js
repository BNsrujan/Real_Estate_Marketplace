/**
 * logger.js — Production-grade logger using Pino
 *
 * Features:
 *  - Pretty-prints in development, JSON in production/test
 *  - Log level driven by LOG_LEVEL env var (default: 'info')
 *  - Automatic request-id and timestamp on every log line
 *  - Redacts sensitive fields before they ever hit stdout
 *  - Child logger factory for per-module context
 *  - Thin Express middleware (req/res logging with duration)
 *
 * Install: npm install pino pino-pretty
 */

import pino from 'pino';

// ── Environment ──────────────────────────────────────────────────────────────

const NODE_ENV  = process.env.NODE_ENV  ?? 'development';
const LOG_LEVEL = process.env.LOG_LEVEL ?? (NODE_ENV === 'production' ? 'info' : 'debug');
const IS_DEV    = NODE_ENV === 'development';

// ── Redaction ────────────────────────────────────────────────────────────────
// Paths listed here are replaced with "[Redacted]" before writing to stdout.
// Covers common shapes: top-level, nested under `req`, and array-wrapped.

const REDACT_PATHS = [
    // Auth / identity
    'password',
    'passwordHash',
    'refreshToken',
    'accessToken',
    'token',
    'apiKey',
    'secret',
    'authorization',

    // HTTP request shapes
    'req.headers.authorization',
    'req.headers.cookie',
    'req.body.password',
    'req.body.token',

    // Payment / PII (add more as needed)
    'cardNumber',
    'cvv',
    'ssn',
];

// ── Transport (pretty in dev, stdout JSON in prod) ───────────────────────────

const transport = IS_DEV
    ? pino.transport({
          target: 'pino-pretty',
          options: {
              colorize:        true,
              translateTime:   'SYS:HH:MM:ss.l',
              ignore:          'pid,hostname',
              singleLine:      false,
              messageFormat:   '{msg}',
          },
      })
    : undefined; // pino writes NDJSON to stdout by default — ideal for log aggregators

// ── Base logger ──────────────────────────────────────────────────────────────

const logger = pino(
    {
        level: LOG_LEVEL,

        // ISO timestamp on every line
        timestamp: pino.stdTimeFunctions.isoTime,

        // Redact before serialising
        redact: {
            paths:  REDACT_PATHS,
            censor: '[Redacted]',
        },

        // Serialisers normalise Error objects and HTTP req/res shapes
        serializers: {
            err: pino.stdSerializers.err,      // { message, stack, type, code }
            req: pino.stdSerializers.req,
            res: pino.stdSerializers.res,
        },

        // Static base fields on every log line
        base: {
            env:  NODE_ENV,
            // pid and hostname are included by default; remove if noisy:
            // pid: undefined, hostname: undefined,
        },
    },
    transport,
);

// ── Child logger factory ──────────────────────────────────────────────────────
/**
 * Returns a child logger with a fixed `module` field.
 * Use inside individual files for easy filtering.
 *
 * @example
 *   import { createLogger } from '../utils/logger.js';
 *   const log = createLogger('auth.middleware');
 *   log.info({ userId }, 'Token refreshed');
 */
const createLogger = (moduleName) =>
    logger.child({ module: moduleName });

// ── Express request-logging middleware ────────────────────────────────────────
/**
 * Attach as early as possible in your Express app:
 *
 *   import { requestLogger } from '../utils/logger.js';
 *   app.use(requestLogger);
 *
 * Logs:
 *   - Incoming:  method, url, userAgent
 *   - Outgoing:  statusCode, duration (ms)
 */
const requestLogger = (req, res, next) => {
    const startAt = process.hrtime.bigint();

    // Assign a lightweight request id (use your own uuid lib if you prefer)
    req.requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

    const reqLog = logger.child({ requestId: req.requestId });

    reqLog.info(
        {
            method:    req.method,
            url:       req.originalUrl ?? req.url,
            userAgent: req.headers['user-agent'],
            ip:        req.ip ?? req.socket?.remoteAddress,
        },
        'Incoming request',
    );

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - startAt) / 1_000_000;
        const level      = res.statusCode >= 500 ? 'error'
                         : res.statusCode >= 400 ? 'warn'
                         : 'info';

        reqLog[level](
            {
                method:     req.method,
                url:        req.originalUrl ?? req.url,
                statusCode: res.statusCode,
                durationMs: Math.round(durationMs * 100) / 100,
            },
            'Request completed',
        );
    });

    next();
};

// ── Graceful shutdown helper ─────────────────────────────────────────────────
/**
 * Flushes buffered log lines before the process exits.
 * Call inside your SIGTERM / SIGINT handlers.
 *
 * @example
 *   process.on('SIGTERM', async () => {
 *       await flushLogger();
 *       process.exit(0);
 *   });
 */
const flushLogger = () =>
    new Promise((resolve) => logger.flush(resolve));

// ── Exports ───────────────────────────────────────────────────────────────────

export { logger, createLogger, requestLogger, flushLogger };