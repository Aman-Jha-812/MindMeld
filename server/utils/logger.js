function getTimestamp() {
  return new Date().toISOString();
}

function logInfo(message, data = null) {
  const ts = getTimestamp();
  if (data) {
    console.log(`[INFO] ${ts} - ${message}`, data);
  } else {
    console.log(`[INFO] ${ts} - ${message}`);
  }
}

function logError(message, error = null) {
  const ts = getTimestamp();
  if (error) {
    console.error(`[ERROR] ${ts} - ${message}`, error);
  } else {
    console.error(`[ERROR] ${ts} - ${message}`);
  }
}

function logWarn(message, data = null) {
  const ts = getTimestamp();
  if (data) {
    console.warn(`[WARN] ${ts} - ${message}`, data);
  } else {
    console.warn(`[WARN] ${ts} - ${message}`);
  }
}

export { logInfo, logError, logWarn };
