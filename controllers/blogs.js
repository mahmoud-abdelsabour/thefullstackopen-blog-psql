const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const { blogFinder, tokenExtractor } = require('../utils/middleware')
const User = require('../models/user')

//api/blogs

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.findAll({})
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

blogsRouter.delete('/:id',blogFinder, async (request, response, next) => {
  try {
    if (!request.blog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    await request.blog.destroy()
    response.status(204).end()
  } catch (error) {
    return next(error)
  }
})

blogsRouter.put('/:id',blogFinder, async (request, response, next) => {
  try {
    const {title, author, url, likes} = request.body

    if(!request.blog) return response.status(404).end()

    request.blog.title = title ? title : request.blog.title
    request.blog.author = author ? author : request.blog.author
    request.blog.url = url ? url : request.blog.url
    request.blog.likes = likes ? likes : request.blog.likes

    const updatedBlog = await request.blog.save()
    return response.status(200).json(updatedBlog)
  } catch (error) {
    return next(error)
  }
})

module.exports = blogsRouter