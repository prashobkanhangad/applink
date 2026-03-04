import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', 'logs');

// Ensure logs directory exists (winston does not create it)
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return stack
    ? `${timestamp} [${level}] ${stack}`
    : `${timestamp} [${level}] ${message}`;
});

const successOnlyFilter = winston.format((info) =>
  info.level === "success" ? info : false
);

// Rotation: creates a new file when date changes (datePattern) or size exceeds maxSize.
// Compression: after rotation, the previous file is gzipped (e.g. info-2025-02-28.log.gz).
// Retention: only the last maxFiles files are kept; older ones are deleted.
const rotateOptions = {
  dirname: logsDir,
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d", // keep 14 days
  zippedArchive: true, // gzip rotated files
};

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    success: 3,
    http: 4,
    verbose: 5,
    debug: 6,
    silly: 7,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "blue",
    success: "green",
  },
};

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: "silly",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      ...rotateOptions,
      filename: "info-%DATE%.log",
      level: "info",
    }),
    new DailyRotateFile({
      ...rotateOptions,
      filename: "error-%DATE%.log",
      level: "error",
    }),
    new DailyRotateFile({
      ...rotateOptions,
      filename: "success-%DATE%.log",
      level: "success",
      format: combine(successOnlyFilter(), timestamp(), logFormat),
    }),
    new winston.transports.Console(),
  ],
});

winston.addColors(customLevels.colors);

// Verify file transport on startup (confirms path and write access)
logger.info(`Logger initialized — writing to ${logsDir} (rotation: daily or 20m, compression: gzip, retain: 14d)`);

export default logger;  