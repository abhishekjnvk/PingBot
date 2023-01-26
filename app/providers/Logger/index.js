'use strict';

const pino = require('pino');
const { resolve } = require('path');
const fs = require('fs');
const httpContext = require('express-http-context');
const log_folder = '../../../logs';
const info_file = resolve(__dirname, log_folder, 'info.log');
const error_file = resolve(__dirname, log_folder, 'error.log');
const debug_file = resolve(__dirname, log_folder, 'debug.log');
const combined_file = resolve(__dirname, log_folder, 'app.log');

const transport = pino.transport({
  targets: [
    {
      level: 'info',
      target: 'pino/file',
      options: {
        destination: info_file,
        timestamp: false,
      },
    },
    {
      level: 'warn',
      target: 'pino/file',
      options: {
        destination: debug_file,
      },
    },
    {
      level: 'error',
      target: 'pino/file',
      options: {
        destination: error_file,
      },
    },
    {
      target: 'pino/file',
      options: {
        destination: combined_file,
        singleLine: true,
        ignore: 'hostname',
      },
    },
    {
      target: 'pino-pretty',
      options: {
        colorize: true,
        timestampKey: 'time',
        singleLine: true,
        ignore: 'hostname',
        translateTime: 'SYS:standard',
      },
    },
  ],
});

const pinoLog = pino(transport);

class Logger {
  constructor() {
    this.pinoLog = pinoLog;
    let dir = resolve(__dirname, log_folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  async info(...message) {
    if (message.length == 1) message = message[0];
    let req_id = httpContext.get('req_id');
    let api_version = httpContext.get('api_version');
    let user_id = httpContext.get('user');
    if (user_id) user_id = user_id._id;
    this.pinoLog.info({ message, req_id, api_version, user_id });
  }

  async debug(...message) {
    if (message.length == 1) message = message[0];
    let req_id = httpContext.get('req_id');
    let api_version = httpContext.get('api_version');
    let user_id = httpContext.get('user');
    if (user_id) user_id = user_id._id;
    this.pinoLog.warn({ message, req_id, api_version, user_id });
  }

  async error(...message) {
    if (message.length == 1) message = message.join(', ');
    let req_id = httpContext.get('req_id');
    let api_version = httpContext.get('api_version');
    let user_id = httpContext.get('user');
    if (user_id) user_id = user_id._id;
    this.pinoLog.error({ message, req_id, api_version, user_id });
  }
}

module.exports = Logger;
