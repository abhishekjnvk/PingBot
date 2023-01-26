const express = require('express');
const router = express.Router();
const service_locator = require('../../../helpers/service_locator');
const logger = service_locator.get('logger');

router.get('/logs', function (req, res, next) {
  logger.info('/logs get()');
  service_locator.get('logControllerV1').getAllLogs(req, res, next);
});

router.get('/log/:id', function (req, res, next) {
  logger.info('/log/:id get()');
  service_locator.get('logControllerV1').getLog(req, res, next);
});

router.get('/log/summary/:id', function (req, res, next) {
  logger.info('/log/summary/:id get()');
  service_locator.get('logControllerV1').getSummary(req, res, next);
});

module.exports = router;
