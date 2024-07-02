const sequelize = require('../sequelize');

const User = require('./user.model');
const Post = require("./post.model")
const Like = require("./like.model")
const Comment = require("./comment.model")



// Sync the models with the database
sequelize.sync()
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch((error) => {
        console.error('Error creating database & tables:', error);
    });

module.exports = { 
    User,
    Post , 
    Like ,
    Comment
};