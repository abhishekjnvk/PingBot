const pool = require("../config/db_config");
var validator = require("validator");
var cache = require("memory-cache");
var helper = require("./master-helper.js");
const masterHelper = require("./master-helper.js");

module.exports.ADD_DOMAIN = async (req, res) => {
  try {
    let domain = req.body.domain;
    let timeout = req.body.timeout;
    let location = req.body.location;
    let tags = req.body.tags;
    let name = req.body.name;
    let emailTime = req.body.emailTime;
    let query = req.body.query;
    if (!domain || !timeout || !name) {
      res.status(200).json({
        message: "Missing parameter",
        status: 0,
      });
    } else {
      if (validator.isURL(domain) || 1 == 1) {
        if (validator.isInt(timeout, { min: 60 })) {
          let user_id = req.user.user_id;
          if (await masterHelper.isUserActive(user_id)) {
            if (!location) location = 1;
            let add_sql =
              "INSERT INTO websites (name,link, timeout, user_id, location,tags,query,emailTime) VALUES (?,?,?,?,?,?,?,?)";
            let result = await pool.query(add_sql, [
              name,
              domain,
              timeout,
              user_id,
              location,
              tags,
              query,
              emailTime
            ]);
            var website = {
              id: result.insertId,
              link: domain,
              timeout: timeout,
            };

            cache.put(`scan_${website.id}`, 1);
            helper.scan(website);
            setInterval(() => {
              helper.scan(website);
            }, timeout * 1000);

            res.status(200).json({
              message: "Domain Registered",
              status: 1,
            });
          } else {
            res.status(200).json({
              message: "Please verify your email in profile section",
              status: 0,
            });
          }
        } else {
          res.status(200).json({
            message: "Invalid Timeout",
            status: 0,
          });
        }
      } else {
        res.status(200).json({
          message: "Invalid Domain",
          status: 0,
          domain,
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
    });
  }
};

module.exports.DELETE_DOMAIN = async (req, res) => {
  try {
    let domain_id = req.body.id;
    if (!domain_id) {
      res.status(200).json({
        message: "Missing parameter",
        status: 0,
      });
    } else {
      let user_id = req.user.user_id;
      domain_id.map(async (id) => {
        let add_sql = "SELECT user_id FROM websites WHERE id=?";
        let [website_data] = await pool.query(add_sql, [id]);
        if (website_data) {
          if (website_data.user_id == user_id) {
            let delete_sql = "DELETE FROM websites WHERE id=?";
            await pool.query(delete_sql, [id]);
            cache.del(`scan_${id}`);

            // res.status(200).json({
            //   message: "Domain Deleted",
            //   status: 1,
            // });
          } else {
            // res.status(200).json({
            //   message: "Domain Doesn't Belongs to you",
            //   status: 0,
            // });
          }
        } else {
          // res.status(200).json({
          //   message: "Domain Doesn't Exist",
          //   status: 0,
          // });
        }
      });
      res.status(200).json({
        message: "Your Request has been processed",
        status: 1,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
    });
  }
};

module.exports.GET_DOMAIN_LOG = async (req, res) => {
  try {
    let id = req.body.id;
    let offset_log_id = req.body.offset_log_id;
    if (!id) {
      res.status(200).json({
        message: "Missing parameter",
        status: 0,
      });
    } else {
      let user_id = req.user.user_id;
      let add_sql =
        "SELECT id, link, timeout, user_id, date, name,tags,emailTime FROM websites WHERE id=?";
      let [website_data] = await pool.query(add_sql, [id]);
      if (website_data) {
        if (website_data.user_id == user_id) {
          if (offset_log_id) {
            let log_sql =
              "SELECT time,response_time,status,log_id FROM logs WHERE website_id=? AND log_id<? ORDER BY log_id DESC LIMIT 50 OFFSET ? ";
            var log_data = await pool.query(log_sql, [id, offset_log_id, 0]);
          } else {
            let log_sql =
              "SELECT time,response_time,status,log_id FROM logs WHERE website_id=? ORDER BY log_id DESC LIMIT 50 OFFSET ? ";
            log_data = await pool.query(log_sql, [id, 0]);
          }
          res.status(200).json({
            message: "Data Fetched",
            status: 1,
            data: log_data,
            website_data,
          });
        } else {
          res.status(200).json({
            message: "Domain Doesn't Belongs to you",
            status: 0,
          });
        }
      } else {
        res.status(200).json({
          message: "Domain Doesn't Exist",
          status: 0,
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
    });
  }
};

module.exports.GET_LATEST_LOG = async (req, res) => {
  try {
    let id = req.body.id;
    let last_log = req.body.last_log;
    if (!id || !last_log) {
      res.status(200).json({
        message: "Missing parameter",
        status: 0,
      });
    } else {
      let user_id = req.user.user_id;
      let add_sql = "SELECT link,user_id FROM websites WHERE id=?";
      let [website_data] = await pool.query(add_sql, [id]);
      if (website_data) {
        if (website_data.user_id == user_id) {
          let log_sql =
            "SELECT time,response_time,status,log_id FROM logs WHERE website_id=? AND log_id>? ORDER BY log_id DESC";
          var log_data = await pool.query(log_sql, [id, last_log]);
          res.status(200).json({
            message: "Data Fetched",
            status: 1,
            data: log_data,
          });
        } else {
          res.status(200).json({
            message: "Domain Doesn't Belongs to you",
            status: 0,
          });
        }
      } else {
        res.status(200).json({
          message: "Domain Doesn't Exist",
          status: 0,
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
    });
  }
};

module.exports.GET_ALL_DOMAIN = async (req, res) => {
  try {
    let user_id = req.user.user_id;
    let add_sql = "SELECT * FROM websites WHERE user_id=? ORDER BY id DESC";
    let website_data = await pool.query(add_sql, [user_id]);
    if (website_data) {
      res.status(200).json({
        message: "Data Fetched",
        status: 1,
        data: website_data,
      });
    } else {
      res.status(200).json({
        message: "Domain Doesn't Exist",
        status: 0,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
    });
  }
};

module.exports.GET_ALL_LOGS = async (req, res) => {
  try {
    let user_id = req.user.user_id;
    let offset_log_id = req.body.offset_log_id;
    if (offset_log_id) {
      let sql = `SELECT * FROM logs LEFT JOIN websites on logs.website_id=websites.id WHERE websites.user_id=? AND logs.log_id<? ORDER BY logs.log_id DESC LIMIT 100`;
      var log_data = await pool.query(sql, [user_id, offset_log_id]);
    } else {
      let sql = `SELECT * FROM logs LEFT JOIN websites on logs.website_id=websites.id WHERE websites.user_id=? ORDER BY logs.log_id DESC LIMIT 100`;
      log_data = await pool.query(sql, [user_id]);
    }
    if (log_data) {
      res.status(200).json({
        message: "Data Fetched",
        status: 1,
        data: log_data,
      });
    } else {
      res.status(200).json({
        message: "NO Logs Available",
        status: 0,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
    });
  }
};

module.exports.GET_ALL_LATEST_LOGS = async (req, res) => {
  try {
    let user_id = req.user.user_id;
    let last_log = req.body.last_log;
    if (!last_log) {
      res.status(200).json({
        message: "Missing parameter",
        status: 0,
      });
    } else {
      let sql = `SELECT * FROM logs LEFT JOIN websites on logs.website_id=websites.id WHERE websites.user_id=? AND logs.log_id>? ORDER BY logs.log_id DESC LIMIT 100`;
      var log_data = await pool.query(sql, [user_id, last_log]);
      res.status(200).json({
        message: "Data Fetched",
        status: 1,
        data: log_data,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
    });
  }
};
