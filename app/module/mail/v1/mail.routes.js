const express = require("express");
const router = express.Router();
const service_locator = require('../../../helpers/service_locator');
const logger = service_locator.get('logger');

router.get('/mail-logs', function (req, res, next) {
    logger.info('/mail-log get()');
    service_locator.get('mailControllerV1').getAllMails(req, res, next);
})

router.get('/mail-log/:id', function (req, res, next) {
    logger.info('/mail-log/:id get()');
    service_locator.get('mailControllerV1').get(req, res, next);
})

module.exports = router;
