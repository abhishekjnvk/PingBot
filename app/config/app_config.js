

module.exports = {
        APP_NAME: process.env.APP_NAME || 'Ping Bot',
        APP_PORT: process.env.PORT || 8080,
        MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/pingBot',
        MIN_PASSWORD_LENGTH: Number(process.env.MIN_PASSWORD_LENGTH) || 6,
        JWT_SECRET: process.env.APP_TOKEN_SECRET || 'myappsecret',
        APP_TOKEN_EXPIRE: Number(process.env.APP_TOKEN_EXPIRE) || 30,
        MS_IN_A_DAY: 86400000,
        SMTP_SECURE:  false,
        SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
        SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
        SMTP_USER: process.env.SMTP_USER || 'bot@sample_app.com',
        SMTP_PASS: process.env.SMTP_PASS || 'password',
        GOOGLE_KEY: process.env.GOOGLE_KEY || '',
        START_BOT: process.env.START_BOT === 'false' ? false : true,
        START_SERVER: process.env.START_SERVER === 'false' ? false : true,
};