const router = require('express').Router()

const { User, Blog } = require('../models')

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: {
        model: Blog
      }
    })
    res.json(users)
  } catch (error) {
    return next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch(error) {
    return next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (user) {
      res.json(user)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    return next(error)
  }
})

router.put('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.params.username
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    user.set(req.body)
    await user.save()
    res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
})

module.exports = router