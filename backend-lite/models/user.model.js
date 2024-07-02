const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const User = sequelize.define('Users', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    photo: {
        type: DataTypes.STRING,
    }
});

User.belongsToMany(User, {
    through: 'UserFollowers',
    as: 'followers',
    foreignKey: 'userId',
    otherKey: 'followerId'
});

User.belongsToMany(User, {
    through: 'UserFollowers',
    as: 'following',
    foreignKey: 'followerId',
    otherKey: 'userId'
});

module.exports = User;
