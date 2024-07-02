const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Assuming this is your Sequelize instance
const User = require('./user.model'); // Assuming the User model is in the same directory
const Post = require('./post.model'); // Assuming the Post model is in the same directory

const Comment = sequelize.define('Comment', {
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Post,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    timestamps: true // Automatically manages createdAt and updatedAt fields
});


module.exports = Comment;
