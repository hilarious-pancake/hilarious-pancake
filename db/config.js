///////////////
// SEQUELIZE //
///////////////

var Sequelize = require('sequelize');

var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
var sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  port: match[4],
  host: match[3],

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
  }
});

exports.db = sequelize;
exports.Item = Item;