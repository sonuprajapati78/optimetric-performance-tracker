const config = require('../config');

const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const levelNames = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG',
};

const currentLogLevel = LogLevel[config.logLevel.toUpperCase()] ?? LogLevel.INFO;

class Logger {
  log(level, message, meta = {}) {
    if (level > currentLogLevel) return;
    
    const timestamp = new Date().toISOString();
    const levelName = levelNames[level];
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    
    const logMessage = `[${timestamp}] [${levelName}] ${message} ${metaStr}`;
    
    if (level === LogLevel.ERROR) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  error(message, meta) {
    this.log(LogLevel.ERROR, message, meta);
  }

  warn(message, meta) {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message, meta) {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message, meta) {
    this.log(LogLevel.DEBUG, message, meta);
  }
}

module.exports = new Logger();
