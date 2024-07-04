const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from app.js
const { sequelize } = require('../models/index'); // Adjust path as per your setup
const { User, Post, Comment, Like } = require('../models/index'); // Adjust path as per your setup
const jwt = require('jsonwebtoken');
const { Jwt_secret } = require('../keys');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // Set to 10 seconds or as needed

describe("Post API - Fetch All Posts", function () {
    // Clean up and prepare database before tests
    beforeAll(async () => {
        await Post.sync({ force: true }); // Ensure tables are created
        await User.sync({ force: true }); // Ensure tables are created
        await Comment.sync({ force: true }); // Ensure tables are created
        await Like.sync({ force: true }); // Ensure tables are created
    });

    beforeEach(async () => {
        // Clear the tables involved in the tests
        await Promise.all([
            User.destroy({ where: {} }),
            Post.destroy({ where: {} }),
            Comment.destroy({ where: {} }),
            Like.destroy({ where: {} })
        ]);
    });

    // Helper function to create a user with a post
    async function createUserAndPost() {
        const user = await User.create({
            name: 'Test User',
            userName: 'testuser1',
            email: 'test1user@example.com',
            password: 'password123'
        });

        const post = await Post.create({
            body: 'This is a test post',
            photo: 'https://example.com/test.jpg', // Provide a valid photo URL or data
            userId: user.id
        });
        // Create a comment on the post
        await Comment.create({
            text: 'Test comment',
            userId: user.id,
            postId: post.id
        });

        // Create a like on the post
        await Like.create({
            userId: user.id,
            postId: post.id
        });
        // Generate JWT token
        const token = jwt.sign({ id: user.id }, Jwt_secret);

        return token; // Return the user object for further use if needed
    }

    it("should fetch all posts with associated details", function (done) {
        createUserAndPost().then((token) => {
            request(app)
                .get('/allposts')
                .set('authorization', `Bearer ${token}`)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);

                    // Assert structure of the response
                    expect(Array.isArray(res.body)).toBe(true); // Response should be an array
                    expect(res.body.length).toBe(1); // Assuming one post is created

                    const post = res.body[0];
                    expect(post).toEqual(jasmine.objectContaining({
                        id: jasmine.any(Number),
                        title: 'Test Post',
                        content: 'This is a test post',
                        createdAt: jasmine.any(String),
                        updatedAt: jasmine.any(String),
                        postedBy: jasmine.objectContaining({
                            id: jasmine.any(Number),
                            name: 'Test User',
                            photo: jasmine.any(String)
                        }),
                        comments: jasmine.arrayContaining([
                            jasmine.objectContaining({
                                id: jasmine.any(Number),
                                text: 'Test comment',
                                createdAt: jasmine.any(String),
                                postedBy: jasmine.objectContaining({
                                    id: jasmine.any(Number),
                                    name: 'Test User',
                                    username: 'testuser'
                                })
                            })
                        ]),
                        likes: jasmine.arrayContaining([
                            jasmine.objectContaining({
                                id: jasmine.any(Number),
                                userId: jasmine.any(Number)
                            })
                        ])
                    }));

                    done();
                });
        });
    });

    // Add more test cases as needed for comments and likes fetching

});
