require('dotenv').config()
const express = require('express')
const app = express()
const serviceLocator = require('./app/helpers/service_locator');
const { app_config } = require('./app/config');
const PORT = app_config.APP_PORT
const Database = require('./app/config/database');
let domainService = serviceLocator.get('domainServiceV1');

let connectDB = async () => {
  await Database._connect(app_config.MONGO_URI)
}

let startBot=async ()=>{
  domainService.startScan()
  serviceLocator.get('logger').info("PingBot started")
}

let startServer = async () => {
  require("./app/base/middleware")(app)
  require("./app/base/routes")(app)
  require("./app/base/handler")(app)
  app.listen(PORT, function () {
    serviceLocator.get('logger').info(`App listening on port ${PORT}!`)
  })
}
connectDB();

if(app_config.START_BOT){
  startBot();
}

if(app_config.START_SERVER){
  startServer();
}