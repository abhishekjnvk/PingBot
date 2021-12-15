class BaseService {
  constructor(opts, modelName = '') {
    this.logger = opts.logger;
    this.modelName = modelName;
    this.config = opts.config;
    this.utils = opts.utils;
    this.errs = opts.errs;
    this.cache = opts.cache;
    this.storage_manager = opts.storage_manager;
    this.databaseService = opts.databaseService;
    this.httpStatus = opts.httpStatus;
  }

  async create(body, model = this.modelName, skipUId = false) {
    const _ = this;
    let userId = _.utils.getUserID();
    body.created_at = _.utils.getTimeStamp();
    if(userId)
      body.created_by = userId;

    const result = await _.databaseService.create(model, body, skipUId);
    _.logger.info(`${model} created successfully`);

    return result;
  }

  async update(id, body, model = this.modelName) {
    const _ = this;
    body.updated_at = _.utils.getTimeStamp();
    body.updated_at = _.utils.getTimeStamp();
    body.updated_by = _.utils.getUserID();
    const result = await _.databaseService.update(model, id, body);
    _.logger.info(`${_.modelName} with id ${id} updated successfully`);

    return result;
  }

  async updateMany(query, body, model = this.modelName) {
    const _ = this;
    const res = await _.databaseService.updateMany(model, query, body);

    _.logger.info(`${model} updated successfully`);

    return res;
  }

  async get(id, model = this.modelName) {
    const _ = this;
    const result = await _.databaseService.getById(model, id);

    if (!result || result.is_deleted) {
      if (result.is_deleted) {
        this.logger.error(`${_.modelName} with id: ${id} is already deleted`);
      }
      const err = _.errs(
        this.httpStatus.NOT_FOUND,
        `${model} with id: ${id} does not exists`
      );
      throw err;
    }

    _.logger.info(`${model} fetched successfully`);

    return result;
  }

  async getOne(query, model = this.modelName, noErr = false, projections = null) {
    const _ = this;
    const result = await _.databaseService.getOneByQuery(
      model,
      query,
      noErr,
      projections
    );
    _.logger.info(`${_.modelName} fetched successfully`);

    return result;
  }


  async getByQuery(query, model = this.modelName, getOne = false, projections = null) {
    const _ = this;
    const result = await _.databaseService.getByQuery(model, query, getOne, projections);
    _.logger.info(`${_.modelName} fetched successfully`);
    return result;
  }

  async getAllWithPagination(
    query,
    page,
    limit,
    sortOption = { created_at: -1 },
    projections,populate = null
  ) {

    const result = await this.databaseService.paginate(
      this.modelName,
      query,
      { sortOption, projections,populate },
      page,
      limit
    );

    return result;
  }

  async getAllLatestFirst(query) {
    const _ = this;
    const result = await _.databaseService.getByQueryAndSort(
      _.modelName,
      query,
      { sortOption: { created_at: -1 } }
    );
    _.logger.info(`${_.modelName} fetched successfully`);

    return result;
  }

  async delete(id, model = this.modelName) {
    const _ = this;

    const result = await _.databaseService.delete(model, id);

    if (!result) {
      const err = _.errs(
        this.httpStatus.NOT_FOUND,
        `${_.modelName} with id: ${id} could not be deleted`
      );
      throw err;
    }

    _.logger.info(`${_.modelName} with id: ${id} deleted successfully`);

    return result;
  }

  /**
   * Delete many documents with query
   */
  async deleteMany(query) {
    const _ = this;

    await _.databaseService.deleteMany(_.modelName, query);

    _.logger.info(`${_.modelName} deleted many items`);

    return true;
  }

  /**
   * Get count of documents based on query
   */
  async getCount(query) {
    const _ = this;
    const count = await _.databaseService.getCount(_.modelName, query);

    _.logger.info(`total count of ${_.modelName} fetched`);

    return { count };
  }

  async softDelete(id, model = this.modelName) {
    const _ = this;
    const updRec = {
      is_deleted: true,
    };

    await _.update(id, updRec, model);
    _.logger.info(
      `${_.modelName} with id: ${id} marked as deleted successfully`
    );
    return true;
  }
}

module.exports = BaseService;
