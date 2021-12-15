const BaseController = require('../../../base/base_controller');

class ProfileControllerV1 extends BaseController {
    constructor(opts) {
        super(opts, 'ProfileControllerV1', 'profileServiceV1');
    }

    async getProfile(req, res, next) {
        try {
            let {_id}=req.user;
            let response = await this.service.getProfile(_id);
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }

    async updateProfile(req, res, next) {
        try {
            let {user:{_id},body}=req;
            let response = await this.service.updateProfile(_id, body);
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    
    async changePassword(req, res, next) {
        try {
            let response = await this.service.changePassword(req.body,req.user);
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
}
module.exports = ProfileControllerV1;
