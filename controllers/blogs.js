const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const resultBlog = await Blog.findById(id)

  if(!resultBlog) return response.status(404).end
  response.json(resultBlog)
})


blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: !body.likes ? 0 : body.likes,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if(blog.user.toString() === user._id.toString()){
    await blog.deleteOne()
    response.status(204).end()
  }else{
    return response.status(401).json({ error: 'invalid token' })
  }

})

blogsRouter.put('/:id', async (request, response) => {
  const {title, author, url, likes} = request.body
  const blog = await Blog.findById(request.params.id)

  if(!blog) return response.status(404).end()

  blog.title = title
  blog.author = author
  blog.url = url
  blog.likes = likes

  updatedBlog = await blog.save()
  return response.status(200).json(updatedBlog)
})

module.exports = blogsRouter