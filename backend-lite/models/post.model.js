const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Assuming this is your Sequelize instance
const User = require('./user.model'); // Assuming the User model is in the same directory
const {Comment} = require("./index")

const Post = sequelize.define('Post', {
    body: {
        type: DataTypes.STRING,
        allowNull: false
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    timestamps: true // Automatically manages createdAt and updatedAt fields
});

// Define association to User
Post.belongsTo(User, { 
    foreignKey: 'userId', // This should match the field name in the Post table that references User
    as: 'postedBy' // Alias to use when loading associations
});



module.exports = Post;
