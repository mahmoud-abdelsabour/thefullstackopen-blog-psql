const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const { blogFinder } = require('../utils/middleware')

//api/blogs

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.findAll({})
  response.json(blogs)
})

blogsRouter.get('/:id',blogFinder, async (request, response) => {
  if(!request.blog) return response.status(404).end
  response.json(request.blog)
})


blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: !body.likes ? 0 : body.likes,
  })

  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id',blogFinder, async (request, response) => {
  if (!request.blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  await request.blog.destroy()
  response.status(204).end()
})

blogsRouter.put('/:id',blogFinder, async (request, response) => {
  const {title, author, url, likes} = request.body

  if(!request.blog) return response.status(404).end()

  request.blog.title = title ? title : request.blog.title
  request.blog.author = author ? author : request.blog.author
  request.blog.url = url ? url : request.blog.url
  request.blog.likes = likes ? likes : request.blog.likes

  const updatedBlog = await request.blog.save()
  return response.status(200).json(updatedBlog)
})

module.exports = blogsRouter