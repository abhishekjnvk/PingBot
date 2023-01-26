'use strict';

const { celebrate, Joi: joi } = require('celebrate');
const { API_METHODS } = require('../domain.constants');

const addDomainValidator = celebrate(
  {
    body : joi.object({
        url : joi.string().required().uri(),
        name : joi.string().required(),
        timeout   : joi.number().min(60).default(60),
        email_alert   : joi.boolean().default(true),
        sms_alert   : joi.boolean().default(false),
        sms_time   : joi.number().min(60).default(60),
        email_time   : joi.number().min(60).default(60),
        method   : joi.string().valid(
         ...Object.values(API_METHODS)
        ).default(API_METHODS.GET),
        tags: joi.array().items(
          joi.string()
        )
    }),
  },
  { allowUnknown: false, stripUnknown: true, warnings: true },
  {}
);

module.exports = {addDomainValidator};
