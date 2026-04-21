require('dotenv').config()

module.exports = {
    MONGODB_URI : process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI,
    PORT : process.env.PORT || 3001,
    DATABASE_URL: process.env.DATABASE_URL,
    SECRET: process.env.SECRET
}