const settingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

settingRouter.post('/', async (req, res, next) => {
    try {
        await Blog.truncate({ cascade: true, restartIdentity: true })
        await User.truncate({ cascade: true, restartIdentity: true })

        return res.status(200).end()
    } catch (error) {
        return next(error)
    }
})

module.exports = settingRouter