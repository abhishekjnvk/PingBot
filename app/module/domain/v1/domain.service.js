const BaseService = require('../../../base/base_service');
const exec = require('await-exec');

class DomainServiceV1 extends BaseService {
  constructor(opts) {
    super(opts, 'Websites');
    this.logModalName = 'Logs';
    this.mailServiceV1 = opts.mailServiceV1;
  }

  async addDomain(body, user) {
    let reqBody = { ...body, user_id: user._id };
    let res = await this.databaseService.create(this.modelName, reqBody);
    this.cache.put(`scan_${res._id}`, res.timeout);
    this.scan(res);
    return res;
  }

  async deleteDomain(id) {
    let res = await this.softDelete(id);
    this.cache.cache.del(`scan_${id}`);
    return res;
  }

  async startScan(page = 1, limit = 10) {
    let domains = await this.databaseService.paginate(
      this.modelName,
      {},
      { id_deleted: true },
      page,
      limit
    );
    console.log(domains.docs);
    domains.docs.map((domain) => {
      this.cache.put(`scan_${domain._id}`, domain.timeout);
      this.scan(domain);
    });
  }

  async scan(website) {
    try {
      let timeout = this.cache.get(`scan_${website._id}`);
      if (timeout) {
        setTimeout(() => {
          this.scan(website);
        }, timeout * 1000);
        var command = `curl -sL -A 'PseudoBot/2.1 (+http://pseudohack.in/bot.html)' -w "%{http_code};%{time_total}" "${website.url}" -o /dev/null`;
        let child = await exec(command);
        let { stdout } = child;
        let response = stdout.split(';');
        let status = response[0];
        let response_time = response[1];
        let isActive = true;
        if (status >= 200 && status <= 399) {
          if (this.cache.get(`reminder_${website._id}`)) {
            this.mailServiceV1.SendSuccessMessage(website, status);
          }
          if (this.cache.get(`mail_in_process_${website._id}`)) {
            this.cache.del(`mail_in_process_${website._id}`);
          }
        }
        if ((status >= 400 && status <= 599) || status < 200) {
          if (!this.cache.get(`mail_in_process_${website._id}`)) {
            this.mailServiceV1.SenErrorMail(website, status);
          }
          isActive = false;
        }
        let body = {
          website_id: website._id,
          user_id: website.user_id,
          is_fine: isActive,
          status,
          response_time,
        };
        this.create(body, this.logModalName);
      } else {
        this.warn(`Website Removed for ${website._id}`);
      }
    } catch (e) {
      this.logger.error(e.message + ': Error in scanning ' + website.url);
    }
  }
}

module.exports = DomainServiceV1;
