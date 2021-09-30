const pool = require("../config/db_config");
const jwt = require("jsonwebtoken");
var util = require("util");
var exec = require("child_process").exec;
var cache = require("memory-cache");
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER, // generated ethereal user
    pass: process.env.SMTP_PASS, // generated ethereal password
  },
});

//this page contains functions for general use
var self = (module.exports = {
  filterString: async function (str) {
    //function to filter string to avoid sql injection attack
    var res = str.replace(/[`~!#$%^&*()|=?;:'",<>\{\}\[\]\\\/]/gi, "");
    var res = res.replace(/ OR /gi, "");
    var res = res.replace(/ AND /gi, "");
    var res = res.replace(/ WHERE /gi, "");
    var res = res.replace(/ SELECT /gi, "");
    var res = res.replace(/ DISTINCT /gi, "");
    var res = res.replace(/ FROM /gi, "");
    var res = res.replace(/ BY /gi, "");
    var res = res.replace(/ GROUP /gi, "");
    var res = res.replace(/ COUNT /gi, "");
    var res = res.replace(/ DROP /gi, "");
    var res = res.replace(/ TABLE /gi, "");
    var res = res.replace(/ CREATE /gi, "");
    var res = res.replace(/ ALTER /gi, "");
    var res = res.replace(/ TRUNCATE /gi, "");
    var res = res.replace(/ DATABASE /gi, "");
    return res;
  },
  getWebsites: async function () {
    var query =
      "SELECT id,user_id,timeout,location,isActive,query,link,name,emailTime FROM websites";
    var result = await pool.query(query);
    // console.log(result)
    return result;
  },
  getUserIdByToken: async function (token) {
    try {
      if (!token) {
        return null;
      }
      let jwt_decode = await jwt.verify(token, process.env.APP_SECRET_KEY);
      return jwt_decode.data.user_id;
    } catch (err) {
      return null;
    }
  },

  getUserByUserID: async function (user_id) {
    var query = `SELECT email,name,user_id FROM users WHERE user_id=${user_id}`;
    var [user] = await pool.query(query);
    return user;
  },
  getUserByEmail: async function (email) {
    var query = `SELECT name,user_id,email FROM users WHERE email='${email}'`;
    var [user] = await pool.query(query);
    return user;
  },
  isUserActive: async function (user_id) {
    var query = `SELECT isActive from users WHERE user_id=${user_id}`;
    var [user] = await pool.query(query);
    return user.isActive;
  },
  insertLog: async function (website, status, response_time) {
    if (status == 200) {
      var comment = 1;
    } else {
      comment = 0;
    }
    pool.query(
      `INSERT INTO logs(website_id, status, response_time, location, comment) VALUES ('${website}','${status}','${response_time}','${process.env.APP_LOCATION}','${comment}')`
    );
  },
  scan: async function (website) {
    if (cache.get(`scan_${website.id}`)) {
      var command = `curl -sL -A 'PseudoBot/2.1 (+http://pseudohack.in/bot.html)' -w "%{http_code};%{time_total}" "${website.link}" -o /dev/null`;
      child = exec(command, function (error, stdout, stderr) {
        if (stderr) {
          console.log("stderr: " + stderr);
          // console.log(stderr);
        } else {
          // console.log(stdout);
          let response = stdout.split(";");
          let status = response[0];
          let response_time = response[1];
          if (status >= 200 && status <= 399) {
            if (cache.get(`reminder_${website.id}`)) {
              self.SendSuccessMessage(website, status);
            }
            if (cache.get(`mail_in_process_${website.id}`)) {
              cache.del(`mail_in_process_${website.id}`);
            }
          }
          if ((status >= 400 && status <= 599) || status < 200) {
            if (!cache.get(`mail_in_process_${website.id}`)) {
              self.SenErrorMail(website, status);
            }
          }
          self.insertLog(website.id, status, response_time);
        }
        if (error !== null) {
          // console.log("exec error: " + error);
        }
      });
    }
  },
  SenErrorMail: async function (website, status) {
    if (!cache.get(`reminder_${website.id}`)) {
      var user = await self.getUserByUserID(website.user_id);
      var text_body = `Hello ${user.name},\n It seems you website labeled as ${website.name} (${website.link}) facing some issue status code ${status}. Please Have a look at this\n\nThis is a system generated email`;
      var html_body = `Hello ${user.name},<br>It seems you website labeled as ${website.name} <a href="${website.link}">(${website.link})</a> facing some issue status code <b>${status}</b>. Please Have a look at this<br><br><center><small>This is a system generated email</small><center>`;
      var subject = `Error ${status} in ${website.name}`;
      cache.put(`mail_in_process_${website.id}`, 1, 21600000); //6 Hrs
      setTimeout(() => {
        if (cache.get(`mail_in_process_${website.id}`)) {
          self.sendMail(
            subject,
            text_body,
            html_body,
            user.email,
            user.user_id
          );
          cache.put(`reminder_${website.id}`, 1, 21600000); //6 Hrs
        }
      }, website.emailTime * 1000);
    }
  },
  SendSuccessMessage: async function (website, status) {
    var user = await self.getUserByUserID(website.user_id);
    var subject = `Error Resolved in ${website.name}`;
    var text_body = `Hello ${user.name},\n This is a gentle reminder that your website labeled as ${website.name} (${website.link}) is fine now. Status Code ${status}`;
    var html_body = `Hello ${user.name},<br>This is a gentle reminder that your website labeled as ${website.name} <a href="${website.link}">(${website.link})</a> is fine now. Status Code <b>${status}</b><br><br><center><small>This is a system generated email</small><center>`;
    self.sendMail(subject, text_body, html_body, user.email, user.user_id);
    cache.del(`reminder_${website.id}`, 1);
  },
  sendMail: async function (
    subject,
    text_body,
    html_body = "",
    email,
    user_id
  ) {
    var data = await transporter.sendMail({
      from: `"PingBot " <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      text: text_body,
      html: html_body,
    });
    var date = new Date().toISOString();
    var sql =
      "INSERT INTO emails(user_id, message, subject, timestamp, message_id) VALUES (?,?,?,?,?)";
    pool.query(sql, [user_id, html_body, subject, date, data.messageId]);

    // console.log(data);
  },
});
