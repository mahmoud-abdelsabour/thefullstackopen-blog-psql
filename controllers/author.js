const authorRouter = require('express').Router()
const Blog = require('../models/blog')
const  { fn, col } = require('sequelize')

authorRouter.get('/', async (req, res, next) => {
    try {
        const authors = await Blog.findAll({
            attributes: [
                'author',
                [fn('COUNT', col('id')), 'articles'],
                [fn('SUM', col('likes')), 'likes']
            ],
            group: ['author'],
            order: [[fn('SUM', col('likes')), 'DESC']]
        })

        return res.json(authors)
    } catch (error) {
        return next(error)
    }
})

module.exports = authorRouter