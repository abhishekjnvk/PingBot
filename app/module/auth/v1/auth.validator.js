'use strict';

const { celebrate, Joi: joi } = require('celebrate');
const service_locator = require('../../../helpers/service_locator');
const config = service_locator.get('config');

const LoginValidator = celebrate(
  {
    body: joi.object({
      email: joi.string().required(),
      password: joi
        .string()
        .required()
        .length(config.app_config.MIN_PASSWORD_LENGTH),
      keep_login: joi.boolean(),
    }),
  },
  { allowUnknown: false, stripUnknown: true, warnings: true },
  {}
);

const RegisterValidator = celebrate(
  {
    body: joi.object({
      email: joi.string().required().email(),
      password: joi.string().required().min(6),
      name: joi.string().required(),
      mobile: joi.string().min(10),
    }),
  },
  { allowUnknown: false, stripUnknown: true, warnings: true },
  {}
);

module.exports = { LoginValidator, RegisterValidator };
