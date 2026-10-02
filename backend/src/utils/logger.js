const fs = require("fs");
const path = require("path");

const logsDirectory = path.join(
  __dirname,
  "../../logs"
);

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, {
    recursive: true,
  });
}

const logFile = path.join(
  logsDirectory,
  "backend.log"
);

function writeLog(level, message, data = null) {
  const timestamp = new Date().toISOString();

  let logMessage = `[${timestamp}] [${level}] ${message}`;

  if (data) {
    logMessage += ` ${JSON.stringify(data)}`;
  }

  logMessage += "\n";

  fs.appendFileSync(logFile, logMessage);

  console.log(logMessage.trim());
}

function info(message, data = null) {
  writeLog("INFO", message, data);
}

function error(message, data = null) {
  writeLog("ERROR", message, data);
}

module.exports = {
  info,
  error,
};