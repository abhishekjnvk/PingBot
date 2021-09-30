const jwt = require("jsonwebtoken");

module.exports.IS_AUTHENTICATED = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.sendStatus(401);
    }
    let jwt_decode = await jwt.verify(token, process.env.APP_SECRET_KEY);
    req.user = jwt_decode.data;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized Access",
      status: 0,
    });
  }
};

module.exports.GET_USER_ID_BY_TOKEN = async (token) => {
  try {
    if (!token) {
      return null;
    }
    let jwt_decode = await jwt.verify(token, process.env.APP_SECRET_KEY);
    return jwt_decode.data.user_id;
  } catch (err) {
    return null;
  }
};
