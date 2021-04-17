const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'cornnerstone'
    },
    port: process.env.PORT || 3004,
    dbhost: process.env.DBHOST || '157.230.150.194',
    db: process.env.DBNAME || 'cornerstone',
    dbuser: process.env.DBUSER || 'appuser',
    dbpass: process.env.DBPASS || 'Pass123@$$123'
  },

  test: {
    root: rootPath,
    app: {
      name: 'cornnerstone'
    },
    port: process.env.PORT || 3004,
    dbhost: process.env.DBHOST || '157.230.150.194',
    db: process.env.DBNAME || 'cornerstone',
    dbuser: process.env.DBUSER || 'appuser',
    dbpass: process.env.DBPASS || 'Pass123@$$123'
  },

  production: {
    root: rootPath,
    app: {
      name: 'cornnerstone'
    },
    port: process.env.PORT || 3004,
    dbhost: process.env.DBHOST || '157.230.150.194',
    db: process.env.DBNAME || 'cornerstone',
    dbuser: process.env.DBUSER || 'appuser',
    dbpass: process.env.DBPASS || 'Pass123@$$123'
  }
};


module.exports = config[env];
