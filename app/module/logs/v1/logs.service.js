const BaseService = require('../../../base/base_service');

class LogServiceV1 extends BaseService {
    constructor(opts) {
        super(opts, 'Logs');
    }
}

module.exports = LogServiceV1;
