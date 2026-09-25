import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = path.join(process.cwd(), 'logs');
let canWriteFileLogs = false;

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  canWriteFileLogs = true;
} catch (error) {
  // If running in a container with a non-root user or read-only filesystem,
  // fallback gracefully to Console logging instead of crashing the process.
  console.warn(
    `[logger] Unable to create local logs directory (${logDir}): ${(error as any)?.message || error}. Falling back to console output.`
  );
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  process.env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
        )
      )
);

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

if (canWriteFileLogs) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});
