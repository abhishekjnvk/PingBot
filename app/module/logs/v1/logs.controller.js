const BaseController = require('../../../base/base_controller');
const { ObjectId } = require('mongodb');

class LogControllerV1 extends BaseController {
  constructor(opts) {
    super(opts, 'LogControllerV1', 'logServiceV1');
  }

  async getAllLogs(req, res, next) {
    try {
      this.logger.info(this.name + ' getAllLogs() called');
      let { _id } = req.user;
      let { page = 1, limit = 100, lastID } = req.query;
      let query = { user_id: _id };
      if (lastID) query = { _id: { $gt: ObjectId(lastID) } };
      let response = await this.service.getAllWithPagination(
        query,
        page,
        limit
      );
      this.logger.info(this.name + ' getAllLogs() Response sent');
      return res.send(response);
    } catch (err) {
      this.logger.error(this.name + ' getAllLogs() Error: ' + err);
      next(err);
    }
  }

  async getLog(req, res, next) {
    try {
      this.logger.info(this.name + ' getLog() called');
      let { id } = req.params;
      let { _id: user_id } = req.user;
      let { page = 1, limit = 20, lastID } = req.query;
      let query = { website_id: id, user_id };
      if (lastID) query = { _id: { $gt: ObjectId(lastID) } };
      let response = await this.service.getAllWithPagination(
        query,
        page,
        limit
      );
      this.logger.info(this.name + ' getLog() Response sent');
      return res.send(response);
    } catch (err) {
      this.logger.error(this.name + ' getLog() Error: ' + err);
      next(err);
    }
  }
}
module.exports = LogControllerV1;
