const BaseService = require('../../../base/base_service');

class LogServiceV1 extends BaseService {
  constructor(opts) {
    super(opts, 'Logs');
    this.databaseService = opts.databaseService;
  }

  async getSummary(websiteId, rQuery, userId) {
    try {
      this.logger.info(this.name + ' getSummary() called');
      let { from, to } = rQuery;
      let query = {
        website_id: websiteId,
        user_id: userId,
      };
      if (from) {
        if (from > to) throw new Error('Invalid date range');
        if (!to) to = Date.now();

        query = {
          ...query,
          created_at: {
            $gte: Number(from),
            $lte: Number(to),
          },
        };
      }

      let response = await this.databaseService.aggregate('Logs', [
        {
          $match: query,
        },
        {
          $sort: { response_time: 1 },
        },
        {
          $group: {
            _id: '$website_id',
            response_time: { $push: '$response_time' },
            status: { $push: '$status' },
            total: { $sum: 1 },
            success: { $sum: { $cond: ['$status', 1, 0] } },
            failed: { $sum: { $cond: ['$status', 0, 1] } },
          },
        },
        {
          $project: {
            total: 1,
            success: 1,
            failed: 1,
            min: { $min: '$response_time' },
            max: { $max: '$response_time' },
            avg: { $avg: '$response_time' },
            median: {
              $arrayElemAt: [
                '$response_time',
                { $floor: { $multiply: [{ $size: '$response_time' }, 0.5] } },
              ],
            },
            p90: {
              $arrayElemAt: [
                '$response_time',
                { $floor: { $multiply: [{ $size: '$response_time' }, 0.9] } },
              ],
            },
            p95: {
              $arrayElemAt: [
                '$response_time',
                { $floor: { $multiply: [{ $size: '$response_time' }, 0.95] } },
              ],
            },
          },
        },
      ]);

      this.logger.info(this.name + ' getSummary() Response sent');

      if (response.length) return response[0];
      else {
      }
    } catch (err) {
      this.logger.error(this.name + ' getSummary() Error: ' + err);
      throw err;
    }
  }
}

module.exports = LogServiceV1;
