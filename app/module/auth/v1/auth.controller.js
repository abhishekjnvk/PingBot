const BaseController = require('../../../base/base_controller');

class AuthControllerV1 extends BaseController {
    constructor(opts) {
        super(opts, 'AuthControllerV1', 'authServiceV1');
    }

    async login(req, res, next) {
        try {
            this.logger.info(this.name+" login() called");
            let response = await this.service.login(req.body);
            res.status(200).json(response);
            this.logger.info(this.name+" login() called");
        }
        catch (err) {
            next(err);
        }
    }
    async register(req, res, next) {
        try {
            this.logger.info(this.name+" register() called");
            let response = await this.service.register(req.body);
            res.status(200).json(response);
            this.logger.info(this.name+" login() called");

        }
        catch (err) {
            next(err);
        }
    }
}
module.exports = AuthControllerV1;
