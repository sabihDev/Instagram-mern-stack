const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Assuming this is your Sequelize instance
const User = require('./user.model'); // Assuming the User model is in the same directory
const Post = require('./post.model'); // Assuming the Post model is in the same directory

const Like = sequelize.define('Like', {
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
    timestamps: false // No timestamps for the Like model
});

module.exports = Like;
