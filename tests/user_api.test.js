const bcrypt = require('bcrypt')
const User = require('../models/user')
const {beforeEach, after, test, describe} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const supertest = require('supertest')

const api = supertest(app)

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({username: 'root', passwordHash: passwordHash, name: 'rootName'})

        await user.save()
    })

    describe('User Tests', () => {
        test('invalid user missing username', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                name:'mahmoud',
                password: 'abc123'
            }

            const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

            const usersAtEnd = await helper.usersInDb()


            assert.strictEqual(response.body.error, 'User validation failed: username: Path `username` is required.')
            assert.strictEqual(usersAtStart.length, usersAtEnd.length)
        })
        test('invalid user short username', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'ma',
                name: 'mahmoud',
                password: 'abc123'
            }

            const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

            const usersAtEnd = await helper.usersInDb()


            assert.strictEqual(response.body.error, 'User validation failed: username: Path `username` (`ma`, length 2) is shorter than the minimum allowed length (3).')
            assert.strictEqual(usersAtStart.length, usersAtEnd.length)



        })

    //////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////

        test('invalid user missing password', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'mahmoud.ahmed03',
                name:'mahmoud',
            }

            const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

            const usersAtEnd = await helper.usersInDb()


            assert.strictEqual(response.body.error, 'password should be at least 3 characters')
            assert.strictEqual(usersAtStart.length, usersAtEnd.length)
        })
        test('invalid user short password', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'mahmoud.ahmed03',
                name: 'mahmoud',
                password: 'a'
            }

            const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

            const usersAtEnd = await helper.usersInDb()


            assert.strictEqual(response.body.error, 'password should be at least 3 characters')
            assert.strictEqual(usersAtStart.length, usersAtEnd.length)



        })
    })


})

after(async () => {
    await mongoose.connection.close()
})