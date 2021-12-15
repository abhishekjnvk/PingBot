const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs')
const httpContext = require('express-http-context');
const {app_config} = require('../config')

const signToken = async (data,keepLogin=false) => {
    const expireTime = keepLogin
        ? app_config.APP_TOKEN_EXPIRE * app_config.MS_IN_A_DAY
        : app_config.MS_IN_A_DAY;
    const opts = {
        expiresIn: `${expireTime}`,
    };
    
    return new Promise((resolve, reject) => {
        jwt.sign(data, app_config.JWT_SECRET, opts, (err, token) => {
            if (err) {
                return reject(err);
            }

            return resolve(token);
        });
    });
};

const getTokenFromHeader = req => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
        return req.headers.authorization.split(' ')[1];
    }
    else {
        return ''
    }
};

const verifyTokenFromHeader = async req => {
    try {
        const token = getTokenFromHeader(req);
        if (!token) {
            return null;
        }
        let decodedData = await jwt.verify(token, app_config.JWT_SECRET)
        return (decodedData);
    }
    catch (err) {
        return null;
    }
}

const decodeToken = async req => {
    try {
        const decodedData = await verifyTokenFromHeader(req);

        return decodedData;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new Error('TokenExpiredError');
        }
    }
};


const getHash = async str => {
    const salt = await bcrypt.genSalt(12);
    const hashValue = await bcrypt.hash(str, salt);

    return hashValue;
};

const compare = async (plainText, hashText) => {
    const isMatch = await bcrypt.compare(plainText, hashText);

    return isMatch;
};

const getRandomString = () => crypto.randomBytes(16).toString('hex');



const getTimeStamp = () => {
    return dayjs().unix()
};


const getUserID = () => {
    let user = httpContext.get('user') || {};
    return user._id || ''
}


module.exports = {
    signToken,
    getTokenFromHeader,
    verifyTokenFromHeader,
    decodeToken,
    getHash,
    compare,
    getRandomString,
    getTimeStamp,
    getUserID,
}