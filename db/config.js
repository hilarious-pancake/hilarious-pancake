// ////////
// // PG //
// ////////

// var pg = require('pg');

// pg.connect(process.env.DATABASE_URL, function(err, client){

// });













///////////////
// SEQUELIZE //
///////////////

var Sequelize = require('sequelize');

var sequelize = new Sequelize('sifter', 'root', '', {
  host: process.env.DATABASE_URL,
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

var Item = sequelize.define('item', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  category: Sequelize.STRING,
  description: Sequelize.STRING,
  url: Sequelize.STRING,
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  timestamps: true
});

sequelize.sync();