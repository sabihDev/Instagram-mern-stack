const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from app.js
const sequelize = require('../sequelize'); // Adjust path as per your setup
const { User, Post } = require('../models/index'); // Adjust path as per your setup
const jwt = require('jsonwebtoken');
const { Jwt_secret } = require('../keys');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000; // Set to 20 seconds or as needed

describe("Create Post API", function () {
    // Clean up and prepare database before tests
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Ensure tables are created
    });

    beforeEach(async () => {
        // Clear the tables involved in the tests
        await Promise.all([
            User.destroy({ where: {} }),
            Post.destroy({ where: {} })
        ]);
    });

    // Helper function to generate a JWT token for authentication
    async function generateAuthToken(userId) {
        return jwt.sign({ id: userId }, Jwt_secret);
    }

    it("should create a new post when authenticated", function (done) {
        // Create a user
        User.create({
            name: 'Test User',
            userName: 'testuser',
            email: 'testuser@example.com',
            password: 'password123'
        }).then(async (user) => {
            // Generate JWT token
            const token = await generateAuthToken(user.id);

            // Make a POST request to create a new post
            request(app)
                .post('/createPost')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    body: 'Test post body',
                    pic: 'https://example.com/test.jpg'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);

                    // Assert the response structure
                    expect(res.body).toHaveProperty('post');
                    expect(res.body.post).toHaveProperty('id');
                    expect(res.body.post.body).toBe('Test post body');
                    expect(res.body.post.photo).toBe('https://example.com/test.jpg');
                    expect(res.body.post.userId).toBe(user.id);

                    done();
                });
        });
    });

    it("should return an error if fields are missing", function (done) {
        // Create a user
        User.create({
            name: 'Test User',
            userName: 'testuser',
            email: 'testuser@example.com',
            password: 'password123'
        }).then(async (user) => {
            // Generate JWT token
            const token = await generateAuthToken(user.id);

            // Make a POST request with missing fields
            request(app)
                .post('/createPost')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    body: 'Test post body'
                    // Missing 'pic' field intentionally
                })
                .expect(422)
                .end(function (err, res) {
                    if (err) return done(err);

                    // Assert the error response
                    expect(res.body).toHaveProperty('error');
                    expect(res.body.error).toBe('Please add all the fields');

                    done();
                });
        });
    });

    it("should return 401 Unauthorized if not authenticated", function (done) {
        // Make a POST request without authentication
        request(app)
            .post('/createPost')
            .send({
                body: 'Test post body',
                pic: 'https://example.com/test.jpg'
            })
            .expect(401)
            .end(done);
    });

    // Add more test cases as needed

});
