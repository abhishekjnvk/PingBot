const express = require("express");
const router = express.Router();
const service_locator = require('../../../helpers/service_locator');
const logger = service_locator.get('logger');
const {addDomainValidator} = require('./domain.validator');

router.get('/domain/:id/', function (req, res, next) {
    logger.info('/domain/:id put()');
    service_locator.get('domainControllerV1').get(req, res, next)
})

router.get('/domains', function (req, res, next) {
    logger.info('/domains get()');
    service_locator.get('domainControllerV1').getDomains(req, res, next)
})

router.post('/domain',addDomainValidator, function (req, res, next) {
    logger.info('/domain post()');
    service_locator.get('domainControllerV1').addDomain(req, res, next)
})

router.delete('/domain/:id', function (req, res, next) {
    logger.info('/domain/:id delete()');
    service_locator.get('domainControllerV1').deleteDomain(req, res, next)
})

module.exports = router;
