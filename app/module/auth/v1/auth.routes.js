const express = require("express");
const router = express.Router();
const service_locator = require('../../../helpers/service_locator');
const logger = service_locator.get('logger');
const {LoginValidator,RegisterValidator} = require('./auth.validator');

router.post('/auth/login',LoginValidator, function (req, res, next) {
    logger.info('/auth/login post()');
    service_locator.get('authControllerV1').login(req, res, next);
})

router.post('/auth/register',RegisterValidator, function (req, res, next) {
    logger.info('/auth/register post()');
    service_locator.get('authControllerV1').register(req, res, next);
})

module.exports = router;
