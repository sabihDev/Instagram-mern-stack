const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const User = require('./user.model');

const Follower = sequelize.define('Follower', {
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    followerId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    }
});

module.exports = Follower;
