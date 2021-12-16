const BaseController = require('../../../base/base_controller');

class MailControllerV1 extends BaseController {
    constructor(opts) {
        super(opts, 'MailControllerV1', 'mailServiceV1');
    }

    async getAllMails(req, res, next) {
        try {
            this.logger.info(this.name + " getAllMails() called");
            console.log(req.query);
            let { _id: user_id } = req.user;
            let { page = 1, limit = 100 } = req.query;
            let response = await this.service.getAllWithPagination({ user_id }, page, limit,{created_at:-1},['_id','website_id','subject','created_at']);
            this.logger.info(this.name + " getAllMails() Response sent");
            return res.send(response);
        } catch (err) {
            this.logger.error(this.name + " getAllMails() Error: " + err);
            next(err);
        }
    }
}
module.exports = MailControllerV1;
