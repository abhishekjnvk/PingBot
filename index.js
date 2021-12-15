require('dotenv').config()
const express = require('express')
const app = express()
const serviceLocator = require('./app/helpers/service_locator');
const { app_config } = require('./app/config');
const PORT = app_config.APP_PORT || 8080
const Database = require('./app/config/database');


require("./app/base/middleware")(app)
require("./app/base/routes")(app)
require("./app/base/handler")(app)


let domainService = serviceLocator.get('domainServiceV1');

const startServer = async () => {
  await Database._connect(app_config.MONGO_URI);
  app.listen(PORT, function () {
    setTimeout(() => {
      domainService.startScan()
    }, 5000);
    serviceLocator.get('logger').info(`App listening on port ${PORT}!`)
  })

};

startServer();