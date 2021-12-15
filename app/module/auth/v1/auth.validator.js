'use strict';

const { celebrate, Joi: joi } = require('celebrate');

const LoginValidator = celebrate(
  {
    body : joi.object({
      email : joi.string().required(),
      password : joi.string().required().length(6),
      keep_login   : joi.boolean(),
    }),
  },
  { allowUnknown: false, stripUnknown: true, warnings: true },
  {}
);

const RegisterValidator = celebrate(
  {
    body : joi.object({
      email : joi.string().required().email(),
      password : joi.string().required().min(6),
      name : joi.string().required(),
      mobile : joi.string().min(10),
    }),
  },
  { allowUnknown: false, stripUnknown: true, warnings: true },
  {}
);

module.exports = {LoginValidator,RegisterValidator};
