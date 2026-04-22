const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const { blogFinder, tokenExtractor } = require('../utils/middleware')
const User = require('../models/user')
const { Op } =  require('sequelize')
//api/blogs

blogsRouter.get('/', async (request, response, next) => {
  try {
    const where = {}
    if (request.query.search){
      where.title = {
        [Op.substring]: request.query.search
      }
    }

    const blogs = await Blog.findAll({
      include: {
        model: User,
      },
      where
    })
    response.json(blogs)
  } catch (error) {
    return next(error)
  }
})

blogsRouter.get('/:id',blogFinder, async (request, response, next) => {
  try {
    if(!request.blog) return response.status(404).end
    response.json(request.blog)
  } catch (error) {
    return next(error)
  }
})


blogsRouter.post('/',tokenExtractor, async (request, response, next) => {
  try {
    const body = request.body
    const user = await User.findByPk(request.decodedToken.id)

    const blog = await Blog.create({...request.body, userId: user.id})

    response.status(201).json(blog)
  } catch (error) {
    return next(error)
  }
})

blogsRouter.delete('/:id', tokenExtractor, blogFinder, async (request, response, next) => {
  try {

    const blog = request.blog

    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    const user = await User.findByPk(request.decodedToken.id)

    if (!user || blog.userId !== user.id) {
      return response.status(403).json({ error: 'forbidden' })
    }

    await blog.destroy()
    response.status(204).end()
  } catch (error) {
    return next(error)
  }
})

blogsRouter.put('/:id',tokenExtractor, blogFinder, async (request, response, next) => {
  try {
    const blog = request.blog
    if(!blog) return response.status(404).end()

    const user = await User.findByPk(request.decodedToken.id)

    if (!user || blog.userId !== user.id) {
      return response.status(403).json({ error: 'forbidden' })
    }

    blog.set(request.body)
    await blog.save()
    return response.status(200).json(blog)
  } catch (error) {
    return next(error)
  }
})

module.exports = blogsRouter