const cuid = require('cuid');
const httpContext = require('express-http-context');
const httpStatus = require('http-status');
const errs = require('http-errors');
const { verifyTokenFromHeader } = require("./utils")

const uniqueReqId = (req, res, next) => {
  httpContext.ns.bindEmitter(req);
  httpContext.ns.bindEmitter(res);
  let requestId = cuid();
  httpContext.set("req_id", requestId);
  next();
};


const requestVersion = (req, res, next) => {
  let version = (req.originalUrl).split('/')[1]
  httpContext.set("api_version", version);
  next();
}

const unprotected_routes = [
  'api',
  'auth']

const verifyLogin = async (req, res, next) => {
  try {
    let route = (req.originalUrl).split('/')[2]
    if (unprotected_routes.includes(route)) {
      next()
    } else {
      let data = await verifyTokenFromHeader(req);
      if (data) {
        httpContext.set("user", data._doc);
        req.user = data._doc;
        next();
      } else {
        const err = errs(
          httpStatus.UNAUTHORIZED,
          'Invalid token'
        );
        throw err;
      }
    }
  }
  catch (err) {
    res.status(401);
    next(err, 401)
  }
}

module.exports = { uniqueReqId, requestVersion, verifyLogin };
