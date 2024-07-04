const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from app.js
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Jwt_secret } = require('../config/config.json');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // Set to 10 seconds or as needed

describe("User Authentication - Signin", function () {
    // Clean up and prepare database before tests
    beforeAll(async () => {
        await User.sync({ force: true }); // Ensure tables are created
    });

    beforeEach(async () => {
        await User.destroy({ where: {} }); // Clear the table before each test
    });

    // Helper function to create a user with hashed password
    async function createUser() {
        const password = await bcrypt.hash('password123', 12);
        return User.create({
            name: 'Test User',
            userName: 'testuser',
            email: 'testuser@example.com',
            password: password
        });
    }

    it("should signin with valid credentials", function (done) {
        createUser().then(() => {
            request(app)
                .post('/signin')
                .send({ email: 'testuser@example.com', password: 'password123' })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.body).toEqual(jasmine.objectContaining({
                        token: jasmine.any(String),
                        user: jasmine.objectContaining({
                            id: jasmine.any(Number),
                            name: 'Test User',
                            email: 'testuser@example.com'
                        })
                    }));
                    done();
                });
        });
    });

    it("should not signin with invalid email", function (done) {
        createUser().then(() => {
            request(app)
                .post('/signin')
                .send({ email: 'wrongemail@example.com', password: 'password123' })
                .expect(422)
                .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.body.error).toBe('Invalid email or password');
                    done();
                });
        });
    });

    it("should not signin with invalid password", function (done) {
        createUser().then(() => {
            request(app)
                .post('/signin')
                .send({ email: 'testuser@example.com', password: 'wrongpassword' })
                .expect(422)
                .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.body.error).toBe('Invalid email or password');
                    done();
                });
        });
    });

    it("should return error if email or password is missing", function (done) {
        request(app)
            .post('/signin')
            .send({ email: 'testuser@example.com' }) // Missing password
            .expect(422)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res.body.error).toBe('Please add email and password');
                done();
            });
    });
});
