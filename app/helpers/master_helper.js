let serviceLocator = require('./service_locator');
let databaseService = serviceLocator.get('databaseService');
let logger = serviceLocator.get('logger');

const helper = {
  getAllDomains: async function (page = 1, limit = 100) {
    let domain = await databaseService.paginate('Websites', {}, {}, page, limit);
    return domain;
  },

  getUserByID: async function (id) {
    try {
      return await databaseService.getById('Users', id);
    } catch (e) {
      logger.error(e.message + ": Error in getting user by id");
    }
  },
  
  createMailLog: async function (body) {
    try {
      databaseService.create('MailLogs', body);
    } catch (e) {
      logger.error(e.message + ": Error in insertion of Mail Log");
    }
  },

  handleLog: async function (
    website_id,
    user_id,
    is_fine,
    status,
    response_time,
  ) {
    try {
      let log = {
        website_id,
        is_fine,
        status,
        user_id,
        response_time,
      }
      await databaseService.create('Logs', log);
    } catch (e) {
      logger.error(e.message + ": Error in insertion of log");
    }
  },

}

module.exports = helper;