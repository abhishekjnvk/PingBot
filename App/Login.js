const pool = require("../config/db_config");
const jwt = require("jsonwebtoken");
var Helper = require("./master-helper");
var md5 = require("md5");
const { v4: uuidv4 } = require("uuid");
var moment = require("moment");
const { isEmail } = require("node-simple-validator");
var cache = require("memory-cache");
const masterHelper = require("./master-helper");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_KEY);

module.exports.LOGIN = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;

    let keep_me_login = req.body.keep_me_login;
    if (!email || !password) {
      res.status(401).json({
        message: "Missing parameter",
        status: 0,
      });
    } else {
      email = await Helper.filterString(email);
      email = email.toLowerCase();
      let sql = `SELECT * FROM users WHERE email = ?`;
      const [userInfo] = await pool.query(sql, [email, 0]);
      if (!userInfo) {
        res.status(401).json({
          message: "Account Doesn't Exist",
          status: 0,
        });
      } else {
        const ip = req.connection.remoteAddress;
        if (userInfo.password == md5(password)) {
          // if (userInfo.isActive) {
          if (keep_me_login) var expiry = moment().add(1, "month").unix();
          else expiry = moment().add(1, "day").unix();
          let accessToken = jwt.sign(
            {
              data: {
                email: email,
                user_id: userInfo.user_id,
              },
              exp: expiry,
            },
            process.env.APP_SECRET_KEY
          );
          res.status(200).json({
            message: "Login Successful",
            status: 1,
            accessToken,
            user_id: userInfo.user_id,
          });
          // } else {
          //   res.status(401).json({
          //     message: "your account is deactivated please contact to admin",
          //     status: 0,
          //   });
          // }
        } else {
          res.status(401).json({
            message: "Invalid Credential",
            status: 0,
          });
        }
      }
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
    });
  }
};

module.exports.VerifyEmail = async (req, res) => {
  try {
    let email = req.body.email;
    let token = req.body.token;

    if (!email || !token) {
      res.status(401).json({
        message: "Missing parameter",
        status: 0,
      });
    } else {
      var server_token = cache.get(`verify_link_${email}`);
      if (server_token == token) {
        let sql = `UPDATE users SET isActive=? WHERE email=?`;
        await pool.query(sql, [1, email]);
        res.status(200).json({
          message: "Email Verified",
          status: 1,
        });
        cache.del(`verify_link_${email}`);
      } else {
        res.status(401).json({
          message: "Invalid Link",
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

module.exports.REGISTER = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    let mobile = req.body.mobile;

    let keep_me_login = req.body.keep_me_login || 1;
    if (!email || !password) {
      res.status(401).json({
        message: "Missing parameter",
        status: 0,
      });
    } else {
      email = await Helper.filterString(email);
      email = email.toLowerCase();
      if (isEmail(email)) {
        if (password.length > 5) {
          email = await Helper.filterString(email);
          let sql = `SELECT * FROM users WHERE email = ?`;
          var [userInfo] = await pool.query(sql, [email, 0]);
          if (!userInfo) {
            let reg_sql =
              "INSERT INTO users (email, password,name,mobile, plan, isActive) VALUES (?,?,?,?,?,?)";
            userInfo = await pool.query(reg_sql, [
              email,
              md5(password),
              name,
              mobile,
              0,
              0,
            ]);
            var verification_token = uuidv4();
            cache.put(`verify_link_${email}`, verification_token);
            var verification_link =
              process.env.FRONTEND_URL +
              "/user/verify/" +
              verification_token +
              "?email=" +
              email;
            var subject = "Account Verification Link";
            var text_body = `Hello ${name},\n Click n following link ${verification_link} to Verify your account\n\n\nThis is a system generated email`;
            var html_body = `Hello ${name},<br> Click <a href="${verification_link}">(${verification_link})</a> to verify your account.<br><br><center><small>This is a system generated email & valid for single use only</small><center>`;
            masterHelper.sendMail(subject, text_body, html_body, email);

            // const ip = req.connection.remoteAddress;
            // var session_id = uuidv4();
            if (keep_me_login) var expiry = moment().add(1, "month").unix();
            else expiry = moment().add(1, "day").unix();
            let accessToken = jwt.sign(
              {
                data: {
                  email: email,
                  user_id: userInfo.insertId,
                },
                exp: expiry,
              },
              process.env.APP_SECRET_KEY
            );
            res.status(200).json({
              message: "Registration Successful",
              status: 1,
              user_id: userInfo.insertId,
              accessToken,
            });
          } else {
            res.status(401).json({
              message: "Email Already in use",
              status: 0,
            });
          }
        } else {
          res.status(401).json({
            message: "Please Choose a strong password",
            status: 0,
          });
        }
      } else {
        res.status(401).json({
          message: "Invalid Email",
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

module.exports.PROFILE = async (req, res) => {
  try {
    let user_id = req.user.user_id;
    let sql = `SELECT email, google,picture, plan, isActive, name, city, mobile, emailAlert, smsAlert FROM users WHERE user_id = ?`;
    var [userInfo] = await pool.query(sql, [user_id]);
    res.status(200).json({
      message: "Profile Fetched",
      status: 1,
      data: userInfo,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
    });
  }
};

module.exports.UPDATE_PROFILE = async (req, res) => {
  try {
    let user_id = req.user.user_id;
    var { name, city, mobile } = req.body;
    if (name) {
      let sql = `UPDATE users set name=?,city=?,mobile=? WHERE user_id = ?`;
      await pool.query(sql, [name, city, mobile, user_id]);
      res.status(200).json({
        message: "Profile Updated",
        status: 1,
      });
    } else {
      res.status(200).json({
        message: "Missing Required Field",
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

module.exports.CHANGE_PASSWORD = async (req, res) => {
  try {
    let user_id = req.user.user_id;
    var { new_pass, current_pass } = req.body;
    if (current_pass && new_pass) {
      let sql = `SELECT password FROM users WHERE user_id = ?`;
      var [userInfo] = await pool.query(sql, [user_id]);
      if (userInfo.password == md5(current_pass)) {
        new_pass = md5(new_pass);
        let sql = `UPDATE users set password=? WHERE user_id = ?`;
        await pool.query(sql, [new_pass, user_id]);
        res.status(200).json({
          message: "Password Changed",
          status: 1,
        });
      } else {
        res.status(200).json({
          message: "Wrong Password",
          status: 0,
        });
      }
    } else {
      res.status(200).json({
        message: "Missing Required Field",
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

module.exports.RESET_PASSWORD = async (req, res) => {
  try {
    var { email } = req.body;
    if (email) {
      let sql = `SELECT user_id,name FROM users WHERE email = ?`;
      var [userInfo] = await pool.query(sql, [email, 0]);
      if (userInfo) {
        var token = cache.get(`password_reset_${email}`);
        if (!token) {
          token = uuidv4();
          cache.put(`password_reset_${email}`, token, 21600000);
        }
        var reset_link =
          process.env.FRONTEND_URL +
          "/user/reset/verify/" +
          token +
          "?email=" +
          email;
        var subject = "Password Reset Link";
        var text_body = `Hello ${userInfo.name},\n Click n following link to reset your password \n\nThis is a system generated email`;
        var html_body = `Hello ${userInfo.name},<br>You asked for password reset link. Click <a href="${reset_link}">(${reset_link})</a> to reset password.<br><br><center><small>This is a system generated email & valid for 6 hours only</small><center>`;
        masterHelper.sendMail(subject, text_body, html_body, email);
        res.status(200).json({
          message: "Reset Link Sent",
          status: 1,
        });
      } else {
        res.status(200).json({
          message: "Email Not registered",
          status: 0,
        });
      }
    } else {
      res.status(200).json({
        message: "Missing Required Field",
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

module.exports.Create_Password = async (req, res) => {
  try {
    var { token, password, email } = req.body;
    if (token && password && email) {
      var server_token = cache.get(`password_reset_${email}`);
      if (server_token == token) {
        password = md5(password);
        let sql = `UPDATE users SET password=? WHERE email=?`;
        await pool.query(sql, [password, email]);
        cache.del(`password_reset_${email}`);
        res.status(200).json({
          message: "Password Changed",
          status: 1,
        });
      } else {
        res.status(200).json({
          message: "Expired Reset Link",
          status: 0,
        });
      }
    } else {
      res.status(200).json({
        message: "Missing Required Field",
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

module.exports.GoogleLogin = async (req, res) => {
  try {
    var { id_token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_KEY,
    });
    const payload = ticket.getPayload();
    var name = payload.name;
    var email = payload.email;
    var picture = payload.picture;
    var expiry = moment().add(1, "month").unix();
    var user = await masterHelper.getUserByEmail(email);
    if (!user) {
      let reg_sql =
        "INSERT INTO users (email,name, isActive,google,picture) VALUES (?,?,?,?,?)";
      userInfo = await pool.query(reg_sql, [email, name, 1, 1, picture]);
      var accessToken = jwt.sign(
        {
          data: {
            email: email,
            user_id: userInfo.insertId,
          },
          exp: expiry,
        },
        process.env.APP_SECRET_KEY
      );
      var message = "Signup Successful";
      type = "signup";   
    } else {
      let reg_sql =
        "UPDATE users set picture=? WHERE email=?";
      pool.query(reg_sql, [picture,email]);
      accessToken = jwt.sign(
        {
          data: {
            email: email,
            user_id: user.user_id,
          },
          exp: expiry,
        },
        process.env.APP_SECRET_KEY
      );
      message = "Login Successful";
      type = "login";   
    }
    res.status(200).json({
      status: 1,
      message,
      accessToken,
      type
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
      errorCode: "Login_1",
    });
  }
};
