const BaseController = require('../../../base/base_controller');

class DomainControllerV1 extends BaseController {
    constructor(opts) {
        super(opts, 'DomainControllerV1', 'domainServiceV1');
    }

    async addDomain(req, res, next) {
        try {
            this.logger.info(this.name+" addDomain() called");
            let user=req.user;
            let response = await this.service.addDomain(req.body,user);
            this.logger.info(this.name+" addDomain() Response sent");
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }

    async updateDomain(req, res, next) {
        try{
            this.logger.info(this.name+" updateDomain() called");
            let {params:{id},body}=req;
            let response = await this.service.update(id, body);
            this.logger.info(this.name+" updateDomain() Response sent");
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }

    async getDomains(req, res, next) {
        try{
            this.logger.info(this.name+" getDomains() called");
            let {user}=req;
            let response = await this.service.getByQuery({user_id:user._id});
            this.logger.info(this.name+" getDomains() Response sent");
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }

    async deleteDomain(req, res, next) {
        try{
            this.logger.info(this.name+" deleteDomain() called");
            let id=req.params.id;
            let response = await this.service.deleteDomain(id);
            this.logger.info(this.name+" deleteDomain() Response sent");
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }

}
module.exports = DomainControllerV1;
