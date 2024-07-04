// spec/userSpec.js
const request = require('supertest');
const app = require('../app'); // Path to your Express app
const User = require('../models/user.model');

describe("User Authentication", function () {
    beforeAll(async () => {
        await User.sync({ force: true }); // Ensure tables are created
    });

    beforeEach(async () => {
        await User.destroy({ where: {} }); // Clear the table before each test
    });

    it("should register a new user", function (done) {
        request(app)
            .post('/signup')
            .send({ name: 'Test User', userName: 'testuser', email: 'testuser@example.com', password: 'password123' })
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res.body.message).toBe('Registered successfully');
                done();
            });
    });

    it("should not register a user with existing email", function (done) {
        User.create({ name: 'Test User', userName: 'testuser', email: 'testuser@example.com', password: 'password123' })
            .then(() => {
                request(app)
                    .post('/signup')
                    .send({ name: 'Test User 2', userName: 'testuser2', email: 'testuser@example.com', password: 'password123' })
                    .expect(422)
                    .end(function (err, res) {
                        if (err) return done(err);
                        expect(res.body.error).toBe('User already exists with that email');
                        done();
                    });
            });
    });

    it("should not register a user with existing userName", function (done) {
        User.create({ name: 'Test User', userName: 'testuser', email: 'testuser@example.com', password: 'password123' })
            .then(() => {
                request(app)
                    .post('/signup')
                    .send({ name: 'Test User 2', userName: 'testuser', email: 'testuser2@example.com', password: 'password123' })
                    .expect(422)
                    .end(function (err, res) {
                        if (err) return done(err);
                        expect(res.body.error).toBe('User already exists with that userName');
                        done();
                    });
            });
    });
});
