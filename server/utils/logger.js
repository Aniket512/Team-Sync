const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const isDevelopment = process.env.NODE_ENV === 'development';
const currentLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

const shouldLog = (level) => {
  const levels = [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.INFO, LOG_LEVELS.DEBUG];
  return levels.indexOf(level) <= levels.indexOf(currentLevel);
};

const formatLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
};

const logger = {
  error: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(formatLog(LOG_LEVELS.ERROR, message, data));
    }
  },

  warn: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(formatLog(LOG_LEVELS.WARN, message, data));
    }
  },

  info: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(formatLog(LOG_LEVELS.INFO, message, data));
    }
  },

  debug: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  },
};

module.exports = logger;
