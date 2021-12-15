/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-non-literal-require */
'use strict';

const { listModules } = require('awilix');
const serviceLocator = require('../helpers/service_locator');
const logger = serviceLocator.get('logger');
const path = require('path');

const models = listModules(path.join(__dirname,'../module/*/*.model.js'));
const models2 = listModules(path.join(__dirname,'../model/*.model.js'));


class Database{
  constructor() {
    this.mongoose = serviceLocator.get('mongoose');
  }

  async _connect(connection_string) {

    return new Promise((resolve, reject) => {
      this.mongoose.connect(connection_string,{
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );


      const { connection } = this.mongoose;

      connection.on('connected', () => {
        logger.info('Database Connection was Successful');

        return resolve();
      });

      connection.on('error', err => {
        logger.info(`Database Connection Failed${err}`);

        return reject(err);
      });

      connection.on('disconnected', () =>
        logger.info('Database Connection Disconnected')
      );

      process.on('SIGINT', () => {
        connection.close();
        logger.info(
          'Database Connection closed due to NodeJs process termination'
        );

        // eslint-disable-next-line no-process-exit
        process.exit(0);
      });


      models.forEach(model => {
        require(model.path);
      });
      models2.forEach(model => {
        require(model.path);
      });
    });
  }

  async _disConnect() {
    this.mongoose.disconnect();
  }
}

module.exports = new Database();
