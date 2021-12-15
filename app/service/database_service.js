'use strict';
class DatabaseService{
  constructor(opts) {
    this.dbService = opts.mongoService;
  }

  // GET
  async getByQuery(modelName, query, returnOne = false, projections = null) {
    return await this.dbService.getByQuery(
      modelName,
      query,
      returnOne,
      projections
    );
  }

  // GET
  async getOneByQuery(modelName, query, noErr = false, projections = null) {
    return await this.dbService.getOneByQuery(
      modelName,
      query,
      noErr,
      projections
    );
  }

  async getCount(modelName, query) {
    return await this.dbService.getCount(modelName, query);
  }

  async getDistinct(modelName, field, query) {
    return await this.dbService.getDistinct(modelName, field, query);
  }

  async getById(modelName, id, noErr = false, populate = null) {
    return await this.dbService.getById(modelName, id, noErr, populate);
  }

  async getByQueryAndSortWithPagination(
    modelName,
    query,
    { projections = null, sortOption = {}, populate = null },
    page,
    limit
  ) {
    return await this.dbService.getByQueryAndSortWithPagination(
      modelName,
      query,
      { sortOption, projections, populate },
      page,
      limit
    );
  }

  async getByQueryAndSort(
    modelName,
    query,
    { projections = null, sortOption = {}, populate = null }
  ) {
    return await this.dbService.getByQueryAndSort(modelName, query, {
      sortOption,
      projections,
      populate,
    });
  }

  async getCountByGroup(modelName, query, group_key) {
    return await this.dbService.getCountByGroup(modelName, query, group_key);
  }

  async getSumByGroup(modelName, query, sum_key, group_key, unwind) {
    return await this.dbService.getSumByGroup(
      modelName,
      query,
      sum_key,
      group_key,
      unwind
    );
  }

  async search(modelName, query, text, page, limit, projections) {
    return await this.dbService.search(
      modelName,
      query,
      text,
      page,
      limit,
      projections
    );
  }

  // Create
  async create(modelName, newObject, skipUId) {
    return await this.dbService.create(modelName, newObject, skipUId);
  }

  // Update
  async update(modelName, id, updateObject, opts) {
    return await this.dbService.update(modelName, id, updateObject, opts);
  }

  // Delete
  async delete(modelName, id) {
    return await this.dbService.delete(modelName, id);
  }

  async deleteMany(modelName, query) {
    return await this.dbService.deleteMany(modelName, query);
  }

  // Delete
  async findAndDelete(modelName, query) {
    return await this.dbService.findAndDelete(modelName, query);
  }

  async insertMany(modelName, newObjects, skipUId) {
    return await this.dbService.insertMany(modelName, newObjects, skipUId);
  }

  async updateMany(modelName, query, updObjects) {
    return await this.dbService.updateMany(modelName, query, updObjects);
  }

  async populate(refModelName, records, options) {
    return await this.dbService.populate(refModelName, records, options);
  }

  async fuzzySearch(
    modelName,
    query,
    text,
    limit,
    projections = null,
    sort = {}
  ) {
    return await this.dbService.fuzzySearch(
      modelName,
      query,
      text,
      limit,
      projections,
      sort
    );
  }

  async findByIdAndUpdate(modelName, id, updateObject, noErr) {
    return await this.dbService.findByIdAndUpdate(
      modelName,
      id,
      updateObject,
      noErr
    );
  }

  async aggregate(modelName, aggregationPipe = []) {
    return await this.dbService.aggregate(modelName, aggregationPipe);
  }

  async getNextSequence(seqName, seqPrefix, entityId) {
    return await this.dbService.getNextSequence(seqName, seqPrefix, entityId);
  }

  // findOneAndUpdate
  async findOneAndUpdate(modelName, query, updateObject, opts, noErr = false) {
    return await this.dbService.findOneAndUpdate(
      modelName,
      query,
      updateObject,
      opts,
      noErr
    );
  }

  async getOneByQueryAndSort(
    modelName,
    query,
    { projections = null, sortOption = {}, populate = null }
  ) {
    return await this.dbService.getOneByQueryAndSort(modelName, query, {
      sortOption,
      projections,
      populate,
    });
  }

  async paginate(
    modelName,
    query,
    { projections = null, sortOption = {}, populate = null },
    page = 1,
    limit = 10
  ) {
    return await this.dbService.paginate(
      modelName,
      query,
      { projections, sortOption, populate },
      page,
      limit
    );
  }

  async findOneOrCreate(modelName, query, newObject = null, skipUId = false) {
    return await this.dbService.findOneOrCreate(
      modelName,
      query,
      newObject,
      skipUId
    );
  }
}

module.exports = DatabaseService;
