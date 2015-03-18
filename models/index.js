if (!global.hasOwnProperty('db')) {
  var Sequelize = require('sequelize'), sequelize = null;

  if (process.env.HEROKU_POSTGRESQL_NAVY_URL) {
    // the application is executed on Heroku
    sequelize = new Sequelize(process.env.HEROKU_POSTGRESQL_NAVY_URL, {
      dialect:  'postgres',
      protocol: 'postgres',
      port:     match[4],
      host:     match[3],
      logging:  true //false
    });
  } else {
    // the application is executed on the local machine
    sequelize = new Sequelize('sifter', 'root', null, {
      host: '127.0.0.1',
      dialect: 'postgres'
    });
  }

  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    Item: sequelize.import(__dirname + '/item')
  };

  /*
    Associations can be defined here. E.g. like this:
    global.db.User.hasMany(global.db.SomethingElse)
  */
}

module.exports = global.db;

// "use strict";

// var fs        = require("fs");
// var path      = require("path");
// var Sequelize = require("sequelize");
// var basename  = path.basename(module.filename);
// var env       = process.env.NODE_ENV || "development";
// var config    = require(__dirname + '/../config/config.json')[env];
// var sequelize = new Sequelize(config.database, config.username, config.password, config);
// var db        = {};

// fs
//   .readdirSync(__dirname)
//   .filter(function(file) {
//     return (file.indexOf(".") !== 0) && (file !== basename);
//   })
//   .forEach(function(file) {
//     var model = sequelize["import"](path.join(__dirname, file));
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(function(modelName) {
//   if ("associate" in db[modelName]) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;