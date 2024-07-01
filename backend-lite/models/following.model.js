const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const User = require('./user.model');

const Following = sequelize.define('Following', {
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    followingId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    }
});

module.exports = Following;
