const express = require("express");
const router = express.Router();
const service_locator = require('../../../helpers/service_locator');
const logger = service_locator.get('logger');
const {ChangePasswordValidator,UpdateProfileValidator,ChangeEmailValidator} = require('./profile.validator');

router.get('/profile', function (req, res, next) {
    logger.info('/profile get()');
    service_locator.get('profileControllerV1').getProfile(req, res, next);
})

router.put('/profile', UpdateProfileValidator, function (req, res, next) {
    logger.info('/profile get()');
    service_locator.get('profileControllerV1').updateProfile(req, res, next);
})

router.put('/password/change',ChangePasswordValidator, function (req, res, next) {
    logger.info('/password/change put()');
    service_locator.get('profileControllerV1').changePassword(req, res, next);
})

module.exports = router;