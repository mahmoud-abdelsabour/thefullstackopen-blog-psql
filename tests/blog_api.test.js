const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const { update } = require('lodash')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

let token

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)

    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({username: 'root', passwordHash: passwordHash, name: 'rootName'})

    await user.save()

    const response = await api
    .post('/api/login')
    .send({username: 'root', password: 'sekret'})
    .expect(200)

    token = response.body.token
    
})

describe('GET Request tests', () => {

    test('blogs are returned as json', async () => {
        await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    
    test('all blogs are returned' , async () => {
        const response = await api.get('/api/blogs')
    
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('a specific blog can be viewed', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToView = blogsAtStart[0]

        const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

        assert.deepStrictEqual(resultBlog.body, blogToView)
    })

    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api.get(`/api/notes/${validNonexistingId}`).expect(404)
    })

})

describe.only('POST Resquest tests', () => {
    test('a valid blog can be added', async () =>{
        const newBlog = 
        {
            title: 'New Blog',
            author: 'New Author',
            url: 'blog.com/New/blog808',
            likes: '7'
        }

        await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

        const titles = blogsAtEnd.map(r => r.title)
        assert(titles.includes('New Blog'))
    })

    test('verifies that if the likes property is missing from the request, it will default to the value', async () => {
        const newBlog = 
        {
            title: 'missingLikesBlog',
            author: 'No Likes',
            url: 'blog.com/NoLikes/blog808',
        }

        await api.post('/api/blogs').set('Authorization', 'Bearer ' + token).send(newBlog)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].likes, 0)
    })

    test('fails with 400 if title is missing', async () => {
        const missingTitleBlog = {
            author: 'No title',
            url: 'blog.com/Notitle/blog808',
            likes: 65
        }

        const response = await api.post('/api/blogs').set('Authorization', 'Bearer ' + token)
            .send(missingTitleBlog)
            .expect(400)

        assert.ok(response.body.error)
    })

    test('fails with 400 if url is missing', async () => {
    const missingUrlBlog = {
        title: 'no url blog',
        author: 'No Likes',
        likes: 65
    }

    const response = await api.post('/api/blogs').set('Authorization', 'Bearer ' + token)
        .send(missingUrlBlog)
        .expect(400)

    assert.ok(response.body.error)
    })

})

test('verifies that the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const allHaveId = response.body.every(blog => 'id' in blog)
    assert.ok(allHaveId, 'the unique identifier is not named id')
})

test('a Blog can be DELETED', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const titles = blogsAtEnd.map(t => t.title)
    
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    assert(!titles.includes(blogToDelete.title))
})

test.only('a Blog can be UPDATED', async () => {
    const updatedBlog = 
    {
        title: 'Updated title',
        author: 'Ahmed Farouk',
        url: 'blog.com/farouk/blog333',
        likes: 2000
    }
    const blogsAtStart = await helper.blogsInDb()

    await api
    .put(`/api/blogs/${blogsAtStart[0].id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const titles = blogsAtEnd.map(t => t.title)

    assert.strictEqual(blogsAtStart.length, blogsAtEnd.length)
    assert(titles.includes(updatedBlog.title))
})

after(async () => {
    await mongoose.connection.close()
})