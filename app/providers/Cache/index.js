'use strict';
var cache = require("memory-cache");
const Logger=require('../Logger/index');
const logger=new Logger()
class Cache {
    constructor() {}
    get(key) {
        let value = cache.get(key);
        return value;
    }
    del(key) {
        return cache.del(key);
    }
    put(key, value, time) {
        return cache.put(key, value, time);
    }
}

module.exports = Cache;
