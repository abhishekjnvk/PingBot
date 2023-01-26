'use strict';
const service_locator = require('../../../helpers/service_locator');
const config = service_locator.get('config');

const { celebrate, Joi: joi } = require('celebrate');

const ChangePasswordValidator = celebrate(
  {
    body: joi.object({
      new_password: joi
        .string()
        .required()
        .min(config.app_config.MIN_PASSWORD_LENGTH),
      old_password: joi
        .string()
        .required()
        .min(config.app_config.MIN_PASSWORD_LENGTH),
    }),
  },
  { allowUnknown: false, stripUnknown: true, warnings: true },
  {}
);

const UpdateProfileValidator = celebrate(
  {
    body: joi.object({
      name: joi.string(),
      mobile: joi.string().min(10).allow(''),
      city: joi.string().allow(''),
      role: joi.string().allow(''),
    }),
  },
  { allowUnknown: true, stripUnknown: true, warnings: false },
  {}
);

const ChangeEmailValidator = celebrate(
  {
    body: joi.object({
      new_email: joi.string().required().email(),
      password: joi
        .string()
        .required()
        .min(config.app_config.MIN_PASSWORD_LENGTH),
    }),
  },
  { allowUnknown: false, stripUnknown: true, warnings: true },
  {}
);

module.exports = {
  ChangePasswordValidator,
  UpdateProfileValidator,
  ChangeEmailValidator,
};
