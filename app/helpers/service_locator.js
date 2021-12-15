const {
  asClass,
  asValue,
  Lifetime,
  aliasTo,
  createContainer,
} = require('awilix');
const path = require('path');
const { camelCase } = require('lodash');

function ServiceLocator() {
  this.container = createContainer();
  this.register();
}

ServiceLocator.prototype.register = function () {

  this.container
    .loadModules(
      [
        path.join(__dirname, '../module/*/*/*.controller.js'),
        path.join(__dirname, '../module/*/*/*.service.js')
      ],
      {
        formatName: (fileName, { path, value: { name } }) => {
          let moduleName = name;
          return camelCase(moduleName);
        },
        resolverOptions: {
          lifetime: Lifetime.SINGLETON,
          register: asClass,
        },
      }
    )

  // Load Modules
  this.container
    .loadModules(
      [
        path.join(__dirname, '../service/*service.js'),
      ],
      {
        formatName: 'camelCase',
        resolverOptions: {
          lifetime: Lifetime.SINGLETON,
          register: asClass,
        },
      }
    )


  // Load Modules
  this.container
    .loadModules(
      [path.join(__dirname, '../providers/*/index.js'),],
      {
        formatName: (name, descriptor) => descriptor.value.name,
      }
    )
    .register({
      fs: asValue(require('fs')),
    })
    .register({
      uniqueIdGenerator: asValue(require('./unique_id_generator')),
    })
    .register({
      mongoose: asValue(require('mongoose')),
    })
    .register({
      logger: aliasTo('Logger'),
    })
    .register({
      cache: aliasTo('Cache'),
    })
    .register({
      errs: asValue(require('http-errors')),
    })
    .register({
      httpStatus: asValue(require('http-status')),
    })
    .register({
      middleware_helper: asValue(require('./middleware_helper')),
    })
    .register({
      httpStatus: asValue(require('http-status')),
    })
    .register({
      config: asValue(require('../config')),
    })
    .register({
      errs: asValue(require('http-errors')),
    })
    .register({
      jwt: asValue(require('jsonwebtoken')),
    })
    .register({
      utils: asValue(require('./utils')),
    })
};

ServiceLocator.prototype.get = function (dependencyName) {
  try {
    return this.container.resolve(dependencyName);
  } catch (err) {
    console.log(err)
    throw err;
  }
};

module.exports = new ServiceLocator();
