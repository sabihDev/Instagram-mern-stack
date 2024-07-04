const express = require("express");
const router = express.Router();
const { User } = require("../models"); // Ensure your User model is defined and imported correctly
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { Jwt_secret } = require("../keys"); // Ensure you have a secure secret key

// User signup route
router.post("/signup", async (req, res) => {
    const { name, userName, email, password } = req.body;
    if (!name || !email || !userName || !password) {
        return res.status(422).json({ error: "Please add all the fields" });
    }
    try {
        // Check if user with email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(422).json({ error: "User already exists with that email" });
        }
        // Check if user with userName already exists
        const existingUserName = await User.findOne({ where: { userName } });
        if (existingUserName) {
            return res.status(422).json({ error: "User already exists with that userName" });
        }
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 12);
        // Create new user
        const newUser = await User.create({
            name,
            userName,
            email,
            password: hashedPassword
        });
        res.json({ message: "Registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// User signin route
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Please add email and password" });
    }
    try {
        // Find user by email
        const savedUser = await User.findOne({ where: { email } });
        if (!savedUser) {
            return res.status(422).json({ error: "Invalid email or password" });
        }
        // Compare hashed password
        const match = await bcrypt.compare(password, savedUser.password);
        if (match) {
            // Generate JWT token
            const token = jwt.sign({ _id: savedUser.id }, Jwt_secret);
            const { id, name, email, userName } = savedUser;
            res.json({ token, user: { id, name, email, userName } });
        } else {
            return res.status(422).json({ error: "Invalid email or password" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
