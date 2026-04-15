const lodash = require('lodash')

const dummy = blogs => {
    return 1
}

const totalLikes = blogs => blogs.reduce((total, curr) => total + curr.likes, 0)

const favoriteBlog = blogs => blogs.length === 0 ? {} : blogs.reduce((max, curr) => curr.likes > max.likes ? curr : max, blogs[0])

const mostBlogs = blogs => {

    if(blogs.length === 0) return {}

    const groutByAuthor = lodash.groupBy(blogs, 'author')

    const mapToCount = lodash.map(groutByAuthor, (blogs, author) => ({
        author: author,
        blogs: blogs.length
    }))

    const maxBlogs = lodash.maxBy(mapToCount, 'blogs')

    return maxBlogs
}

const mostLikes = blogs => {
    if(blogs.length === 0) return {}

    const maxLikes = lodash.maxBy(blogs, 'likes')
    console.log(maxLikes)
    return { author: maxLikes.author, likes: maxLikes.likes }
}

listHelper = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }

module.exports = listHelper