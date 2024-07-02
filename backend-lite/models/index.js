const sequelize = require('../sequelize');

const User = require('./user.model');
const Follower = require('./follower.model');
const Following = require('./following.model');
const Post = require("./post.model")
const Like = require("./like.model")
const Comment = require("./comment.model")

// Establish relationships
User.hasMany(Follower, { foreignKey: 'userId' });
User.hasMany(Follower, { foreignKey: 'followerId' });
User.hasMany(Following, { foreignKey: 'userId' });
User.hasMany(Following, { foreignKey: 'followingId' });

Follower.belongsTo(User, { foreignKey: 'userId' });
Follower.belongsTo(User, { foreignKey: 'followerId' });

Following.belongsTo(User, { foreignKey: 'userId' });
Following.belongsTo(User, { foreignKey: 'followingId' });


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
    Follower, 
    Following , 
    Post , 
    Like ,
    Comment
};