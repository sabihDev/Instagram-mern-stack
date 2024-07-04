const jwt = require("jsonwebtoken");
const { Jwt_secret } = require("../keys"); // Ensure Jwt_secret is properly imported
const { User } = require("../models"); // Adjust according to your Sequelize models

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;
console.log(req.headers);
    if (!authorization) {
        return res.status(401).json({ error: "You must be logged in 1" });
    }

    const token = authorization.replace("Bearer ", "");

    try {
        const payload = jwt.verify(token, Jwt_secret);
        const { _id } = payload;

        const user = await User.findOne({ where: { id: _id } });
        console.log(user);
        if (!user) {
            return res.status(401).json({ error: "User not found or database error" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "You must be logged in 2" });
    }
};
