/* eslint-disable security/detect-object-injection */
'use strict';

/**
 * Parent Service Class to reduce duplication of code
 *
 */
class MongoService {
  /**
   * initialize dependencies
   */
  constructor(opts) {
    this.uIdGen = opts.uniqueIdGenerator;
    this.mongoose = opts.mongoose;
    this.name = 'DB Service:';
    this.log = opts.logger;
    this.httpStatus = opts.httpStatus;
    this.errs = opts.errs;
  }
  // HELPER FUNCTIONS
  /**
   * get model instance
   * @param modelName model instance to grab
   * @returns model instance
   */
  getModelInstance(modelName) {
    return this.mongoose.model(modelName);
  }

  // GET
  /**
   * Get documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param returnOne flag for returning just one
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getByQuery(modelName, query, returnOne, projections = null) {
    // initialise model
    const model = this.getModelInstance(modelName);

    const result = returnOne
      ? await model.findOne(query, projections).lean()
      : await model.find(query, projections).lean();
    if (!result) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }
    this.log.info(`${this.name} ${modelName} items fetched successfully`);

    return result;
  }

  // GET
  /**
   * Get documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param noErr flag for not throw error
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getOneByQuery(modelName, query, noErr, projections = null) {
    // initialise model
    const model = this.getModelInstance(modelName);

    const result = await model.findOne(query, projections).lean();

    if (!result && !noErr) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} item fetched successfully`);

    return result;
  }

  // GET COUNT
  /**
   * Get Count of documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @returns resulting count of object from query
   */
  async getCount(modelName, query) {
    // initialise model
    const model = this.getModelInstance(modelName);
    const result = await model.find(query).count();
    this.log.info(`${this.name} ${modelName} items fetched successfully`);

    return result;
  }

  /**
   * Get documents by id
   * @param modelName mongoose model's name to query data from
   * @param id id to look for
   * @param noErr boolean to not throw error
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getById(modelName, id, noErr, populate = null) {
    const model = this.getModelInstance(modelName);
    const result = await model.findById(id).populate(populate).lean();

    if (!result && !noErr) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item with id - ${id} could not be found`
      );
      throw err;
    }
    this.log.info(
      `${this.name} ${modelName} item with id - ${id} fetched successfully`
    );

    return result;
  }

  // GET
  /**
   * Get documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param sortOption {field: sorting order} e.g. {name: 1} 1 for ascending and -1 for descending
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getByQueryAndSort(
    modelName,
    query,
    { projections = null, sortOption = {}, populate = null }
  ) {
    // initialise model
    const model = this.getModelInstance(modelName);
    const result = await model
      .find(query, projections)
      .populate(populate)
      .sort(sortOption) // sorts the data
      .lean();

    if (!result) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} items fetched successfully`);

    return result;
  }

  // GET With Pagination
  /**
   * Get documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param sortOption {field: sorting order} e.g. {name: 1} 1 for ascending and -1 for descending
   * @param page document to be skiped
   * @param limit max number of documents to be fetched
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getByQueryAndSortWithPagination(
    modelName,
    query,
    { projections = null, sortOption = {}, populate = null },
    page,
    limit
  ) {
    if (page < 0 || limit < 0) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} Page or Limit cannot be negative`
      );
      throw err;
    }
    // initialise model
    const model = this.getModelInstance(modelName);
    const result = await model
      .find(query, projections)
      .populate(populate)
      .sort(sortOption)
      .skip(page * limit)
      .limit(limit) // sorts the data
      .lean();

    if (!result) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} items fetched successfully`);

    return result;
  }

  /**
   * Get documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param group_key Key for group by
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getCountByGroup(modelName, query, group_key) {
    // initialise model
    const model = this.getModelInstance(modelName);
    const result = await model.aggregate([
      { $match: query },
      { $group: { _id: group_key, count: { $sum: 1 } } },
    ]);
    if (!result) {
      const err = this.errs(
        this.httpStatus.Conflict,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }
    this.log.info(`${this.name} ${modelName} items fetched successfully`);

    return result;
  }

  /**
   * Get sum of a keys-value for grouped docs by another key
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param group_key Key for group by
   * @param sum_key Key for group by
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getSumByGroup(modelName, query, sum_key, group_key, unwind) {
    // initialise model
    const model = this.getModelInstance(modelName);
    let result;
    if (unwind) {
      result = await model.aggregate([
        { $match: query },
        { $unwind: unwind },
        { $group: { _id: group_key, sum: { $sum: sum_key } } },
      ]);
    } else {
      result = await model.aggregate([
        { $match: query },
        { $group: { _id: group_key, sum: { $sum: sum_key } } },
      ]);
    }
    if (!result) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }
    this.log.info(`${this.name} ${modelName} items fetched successfully`);

    return result;
  }

  // GET With Pagination
  /**
   * Get documents by query
   * @param modelName mongoose model's name to query data from
   * @param text text to serahced
   * @param page document to be skiped
   * @param limit max number of documents to be fetched
   * @returns resulting object from text search
   * @error NotFoundError
   */
  async search(modelName, query, text, page, limit, projections = {}) {
    if (page < 0 || limit < 0) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} Page or Limit cannot be negative`
      );
      throw err;
    }
    // initialise model
    let textSearchQuery = { $text: { $search: text } };
    const model = this.getModelInstance(modelName);
    const result = await model
      .find(
        { ...query, ...textSearchQuery },
        { score: { $meta: 'textScore' }, ...projections }
      )
      .sort({ score: { $meta: 'textScore' } })
      .skip(page * limit)
      .limit(limit) // sorts the data
      .lean();
    if (!result) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }
    this.log.info(`${this.name} ${modelName} items fetched successfully`);

    return result;
  }

  // CREATE
  /**
   * Create a document
   * @param modelName mongoose model's name to create
   * @param newObject json object to create the new document with
   * @param skipUId flag to skip uid generation
   * @returns newly created Object
   */
  async create(modelName, newObject, skipUId = false) {
    const model = this.getModelInstance(modelName);
    let newObjectInstance = new model(newObject);


    newObjectInstance = await newObjectInstance.save();
    this.log.info(`${this.name} ${modelName} created successfully`);

    return newObjectInstance;
  }

  // UPDATE
  /**
   * update an existing document
   * @param modelName mongoose model's name to update
   * @param id object to be updated
   * @param updateObject json object to update the new document to
   * @param opts additional options
   * @returns updated object
   */
  async update(modelName, id, updateObject, opts) {
    const model = this.getModelInstance(modelName);
    let options = { new: true };

    if (opts) {
      options = { ...options, ...opts };
    }

    const updatedObjectInstance = await model.findOneAndUpdate(
      { _id: id },
      updateObject,
      options
    );
    if (!updatedObjectInstance) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item with ${id} could not be updated`
      );
      throw err;
    }
    this.log.info(
      `${this.name} ${modelName} item with id: ${id} updated successfully`
    );

    return updatedObjectInstance;
  }

  // UPDATE MANY
  /**
   * update an existing document
   * @param modelName mongoose model's name to update
   * @param query query
   * @param updateObject json object to update the new document to
   * @returns updated object
   */
  async updateMany(modelName, query, updateObject) {
    const model = this.getModelInstance(modelName);
    const result = await model.updateMany(query, updateObject);

    if (!result) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} items could not be updated`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} items updated successfully`);

    return result;
  }

  // DELETE
  /**
   * delete an existing document
   * @param modelName mongoose model's name to delete
   * @param id object to be deleted
   * @returns none
   */
  async delete(modelName, id) {
    const model = this.getModelInstance(modelName);
    const deletedObjectInstance = await model.findOneAndRemove({ _id: id });
    if (!deletedObjectInstance) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item with id: ${id} could not be deleted`
      );
      throw err;
    }
    this.log.info(
      `${this.name} ${modelName} item with id: ${id} deleted successfully`
    );

    return { id };
  }

  /**
   * delete multiple documents
   * @param modelName mongoose model's name
   * @param query query to delete many with
   * @returns none
   */
  async deleteMany(modelName, query) {
    const model = this.getModelInstance(modelName);
    this.log.info(`${this.name} inside DeleteMany`);
    try {
      await model.deleteMany(query);
    } catch (err) {
      this.log.error(`${this.name} Error Encountered in deleteMany`);
      throw err;
    }
  }

  // DELETE
  /**
   * delete an existing document
   * @param modelName mongoose model's name to delete
   * @param query
   * @returns none
   */
  async findAndDelete(modelName, query) {
    const model = this.getModelInstance(modelName);
    const deletedObjectInstance = await model.findOneAndRemove(query);

    if (!deletedObjectInstance) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item  could not be deleted`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} item deleted successfully`);

    return deletedObjectInstance;
  }
  
  // GET DISTINCT
  /**
   * Get distinct documents of a field by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @returns resulting distinct documents from query
   */
  async getDistinct(modelName, field, query) {
    // initialise model
    const model = this.getModelInstance(modelName);
    const result = await model.distinct(field, query);
    this.log.info(`${this.name} ${modelName} items fetched successfully`);

    return result;
  }

  /**
   * @description Populate records with reference model
   * @param refModelName mongoose model's name to query data from
   * @param records records to be updated
   * @returns resulting updated documents
   */
  async populate(refModelName, records, options) {
    const model = this.getModelInstance(refModelName);
    const result = await model.populate(records, options);
    this.log.info(`records with ${refModelName} reference model`);

    return result;
  }

  /**
   * @description fuzzy search using mongoose-fuzzy-searching plugin
   * @param modelName mongoose model's name to query data from
   * @param text text to serahced
   * @param limit max number of documents to be fetched
   * @returns resulting object from fuzzy text search
   */
  async fuzzySearch(
    modelName,
    query,
    text,
    limit,
    projections = null,
    sort = {}
  ) {
    if (limit < 0) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} limit cannot be negative`
      );
      throw err;
    }
    const search = text.slice(0, 10).replace(/[^a-zA-Z0-9 ]/g, ' ');
    const model = this.getModelInstance(modelName);
    const result = await model
      .find(query)
      .fuzzySearch({
        query: search,
        minSize: 4,
      })
      .select(projections)
      .sort(sort)
      .limit(limit)
      .lean();

    if (!result) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }

    return result;
  }

  // findByIdAndUpdate
  /**
   * find by id and update the document
   * @param modelName mongoose model's name to update
   * @param id object to be updated
   * @param updateObject json object to update the new document to
   * @param opts options
   * @returns updated object
   */
  async findByIdAndUpdate(
    modelName,
    id,
    updateObject,
    noErr = false,
    opts = {}
  ) {
    let options = { new: true };
    options = { ...options, ...opts };
    const model = this.getModelInstance(modelName);
    const updatedObjectInstance = await model.findByIdAndUpdate(
      id,
      updateObject,
      options
    );

    if (!updatedObjectInstance && !noErr) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item with ${id} could not be updated`
      );
      throw err;
    }

    this.log.info(
      `${this.name} ${modelName} item with id: ${id} updated successfully`
    );

    return updatedObjectInstance;
  }

  /**
   * Get sum of a keys-value for grouped docs by another key
   * @param modelName mongoose model's name
   * @param aggregationPipe an array of stages
   * @returns resulting object from query
   * @error NotFoundError
   */
  async aggregate(modelName, aggregationPipe = []) {
    // initialise model
    const model = this.getModelInstance(modelName);
    let result;

    result = await model.aggregate(aggregationPipe);

    if (!result) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} items fetched successfully`);

    return result;
  }

  async getNextSequence(seqName, seqPrefix, entityId) {
    const modelName = 'Sequence';

    let sequence = await this.findOneAndUpdate(
      modelName,
      { entity_id: entityId, seq_name: seqName, seq_prefix: seqPrefix },
      { $inc: { seq_value: 1 }, is_current: true },
      { returnOriginal: false, upsert: false },
      true
    );

    if (!sequence) {
      const newObj = {
        entity_id: entityId,
        seq_name: seqName,
        seq_prefix: seqPrefix,
        is_current: true,
        seq_value: 1,
      };

      sequence = await this.create(modelName, newObj);
      await this.updateMany(
        modelName,
        {
          seq_name: seqName,
          entity_id: entityId,
          _id: { $ne: sequence._id },
        },
        { is_current: false }
      );
    }

    return sequence;
  }

  // FIND ONE AND UPDATE
  /**
   * update an existing document
   * @param modelName mongoose model's name to update
   * @param query query
   * @param updateObject json object to update the new document to
   * @param opts additional options
   * @returns updated object
   */
  async findOneAndUpdate(modelName, query, updateObject, opts, noErr = false) {
    const model = this.getModelInstance(modelName);
    let options = { new: true, upsert: true };

    if (opts) {
      options = { ...options, ...opts };
    }

    const updatedObjectInstance = await model.findOneAndUpdate(
      query,
      updateObject,
      options
    );

    if (!updatedObjectInstance && !noErr) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item could not be updated`
      );
      throw err;
    }
    this.log.info(`${this.name} ${modelName} item updated successfully`);

    return updatedObjectInstance;
  }

  /**
   * Get one document by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param sortOption {field: sorting order} e.g. {name: 1} 1 for ascending and -1 for descending
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getOneByQueryAndSort(
    modelName,
    query,
    { projections = null, sortOption = {}, populate = null },
    err = false
  ) {
    // initialise model
    const model = this.getModelInstance(modelName);
    const result = await model
      .findOne(query, projections)
      .sort(sortOption) // sorts the data
      .populate(populate)
      .lean();

    if (!result && err) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} item fetched successfully`);

    return result;
  }

  /**
   * Get documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param sortOption {field: sorting order} e.g. {name: 1} 1 for ascending and -1 for descending
   * @param page document to be skiped
   * @param limit max number of documents to be fetched
   * @returns resulting object from query
   * @error NotFoundError
   */
  async paginate(
    modelName,
    query,
    { projections = null, sortOption = {}, populate = null },
    page = 1,
    limit = 10
  ) {
    if (page <= 0 || limit <= 0) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} Page or Limit cannot be 0 or negative`
      );
      throw err;
    }
    const skip = (page - 1) * limit;
    // initialise model
    const model = this.getModelInstance(modelName);
    const docs = await model
      .find(query, projections)
      .populate(populate)
      .sort(sortOption)
      .skip(skip)
      .limit(limit) // sorts the data
      .lean();

    const total = await this.getCount(modelName, query);
    const pages = Math.ceil(total / limit);

    const result = {
      docs,
      total,
      limit,
      page,
      pages,
    };

    this.log.info(`${this.name} ${modelName} items fetched successfully`);

    return result;
  }

  // FIND ONE OR CREATE
  /**
   * Get or Create Document By query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param doc doc to create
   * @returns resulting object from query
   * @error NotFoundError
   */
  async findOneOrCreate(modelName, query, newObject = null, skipUId = false) {
    // initialise model
    const model = this.getModelInstance(modelName);
    const doc = await model.findOne(query).lean();

    if (doc) {
      this.log.info(`${this.name} ${modelName} item fetched successfully`);

      return doc;
    }
    if (!newObject) newObject = query;

    const newDoc = await this.create(modelName, newObject, skipUId);

    this.log.info(`${this.name} ${modelName} item created successfully`);

    return newDoc;
  }
}

module.exports = MongoService;
