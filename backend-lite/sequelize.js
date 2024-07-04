const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    // storage: 'database.sqlite' 
     storage: ':memory:'
});

module.exports = sequelize;
