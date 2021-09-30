const express = require("express");
const app = express();
var cors = require('cors')
const { LOGIN, REGISTER,VerifyEmail,PROFILE,UPDATE_PROFILE,CHANGE_PASSWORD,RESET_PASSWORD,Create_Password,GoogleLogin } = require("../App/Login");
const { ADD_DOMAIN,DELETE_DOMAIN,GET_DOMAIN_LOG,GET_ALL_DOMAIN,GET_ALL_LOGS,GET_LATEST_LOG,GET_ALL_LATEST_LOGS } = require("../App/Domain");
const {IS_AUTHENTICATED}=require("../App/AuthCheck")
app.use(cors())

app.get("/", (req, res) => {
  res.send("Hello World This is Backend");
});

app.post("/login", LOGIN);
app.post("/verify", VerifyEmail);
app.post("/register", REGISTER);
app.post("/resetPassword", RESET_PASSWORD);
app.post("/createPassword", Create_Password);
app.post("/googleLogin", GoogleLogin);

// All Profile
app.get("/profile",IS_AUTHENTICATED, PROFILE);
app.post("/profile",IS_AUTHENTICATED, UPDATE_PROFILE);
app.post("/changePassword",IS_AUTHENTICATED, CHANGE_PASSWORD);
app.post("/addDomain",IS_AUTHENTICATED, ADD_DOMAIN);

// Domain
app.post("/getAllDomain",IS_AUTHENTICATED, GET_ALL_DOMAIN);
app.post("/deleteDomain",IS_AUTHENTICATED, DELETE_DOMAIN);

// For a domain
app.post("/domainLogs",IS_AUTHENTICATED, GET_DOMAIN_LOG);
app.post("/latestLog",IS_AUTHENTICATED, GET_LATEST_LOG);

// All Domain Logs
app.post("/getAllLogs",IS_AUTHENTICATED, GET_ALL_LOGS);
app.post("/getAllLatestLogs",IS_AUTHENTICATED, GET_ALL_LATEST_LOGS);


app.get("/test", (req, res) => {
  res.json({
    req
  });
});

app.get("*", (req, res) => {
  res.send("Error 404");
});
app.post("*", (req, res) => {
  res.send("Error 404");
});
module.exports = app;
