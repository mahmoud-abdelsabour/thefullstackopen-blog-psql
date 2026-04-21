const logger = require('./logger')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const { SECRET } = require('./config')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  if (!req.blog) {
    return res.status(404).end()
  }
  next()
}

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:', request.path)
  logger.info('Body', request.body)
  logger.info('---')

  next()
}

const unKnownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }else if(error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')){
    return response.status(400).json({ error: 'expected `username` to be unique'})
  }else if(error.name === 'JsonWebTokenError'){
    return response.status(401).json({ error: 'invalid token' })
  }else if(error.name === 'TokenExpiredError'){
    return response.status(401).json({ error: 'token expired' })
  }

  next(error)
}


const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch{
      return res.status(401).json({ error: 'token invalid' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

//const tokenExtractor = (request, response, next) => {
//  const auth = request.get('authorization')
//  request.token = auth && auth.startsWith('Bearer ')
//    ? auth.replace('Bearer ', '')
//    : null
//  next()
//}
//
//const userExtractor = async (request, response, next) => {
//  const decodedToken = jwt.verify(request.token, process.env.SECRET)
//  if(!decodedToken.id) return response.status(401).json({ error: 'invalid token' })
//
//  const user = await User.findById(decodedToken.id)
//  if(!user) return response.status(400).json({ error: 'userId missing or not valid' })
//  request.user = user
//  next()
//}

const middleware = { requestLogger, unKnownEndpoint, errorHandler, blogFinder, tokenExtractor }

module.exports = middleware