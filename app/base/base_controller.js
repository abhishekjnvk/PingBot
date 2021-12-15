'use strict';

class BaseController {
  constructor(opts, name = 'BaseController', serviceName) {
    this.logger = opts.logger;
    this.config = opts.config;
    this.service = opts[serviceName];
    this.utils = opts.utils;
    this.name = name;
  }

  async create(req, res, next) {
    try {
      this.logger.info(this.name + ' create() ');
      let response = await this.service.create(req.body);
      res.send(response);
      res.end();
    } catch (err) {
      this.logger.error(`${this.name} create error: ${err}`);
      next(err);
    }
  }


  async get(req, res, next) {
    try {
      let { params } = req;
      let id = params.id;
      this.logger.info(this.name + ' get() ');
      let response = await this.service.get(id);
      res.send(response);
      res.end();
    } catch (err) {
      this.logger.error(`${this.name} get error: ${err}`);
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      let { params, body } = req;
      let id = params.id;
      this.logger.info(this.name + ' update() ');
      let response = await this.service.update(id, body);
      res.send(response);
      res.end();
    } catch (err) {
      this.logger.error(`${this.name} softDelete error: ${err}`);
      next(err);
    }
  }


  async softDelete(req, res, next) {
    try {
      let { params } = req;
      let id = params.id;

      this.logger.info(this.name + ' softDelete() ');
      let response = await this.service.softDelete(id);
      res.send(response);
      res.end();
    } catch (err) {
      this.logger.error(`${this.name} softDelete error: ${err}`);
      next(err);
    }
  }
}

module.exports = BaseController;
