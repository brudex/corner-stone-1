const path = require("path");
const rootPath = path.normalize(__dirname + "/..");
const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    root: rootPath,
    app: {
      name: "cornerstone",
    },
    port: process.env.PORT || 3004,
    dbhost: process.env.DBHOST || "157.230.150.194",
    db: process.env.DBNAME || "cornerstone",
    dbuser: process.env.DBUSER || "appuser",
    dbpass: process.env.DBPASS || "Pass123@$$123",
    jwt_secret: process.env.JWT_SECRET || "bjdb!@#$#fdfssdy328",
    session_secret: process.env.SESSION_SECRET || "duns3030!#$Aw",
  },

  test: {
    root: rootPath,
    app: {
      name: "cornerstone",
    },
    port: process.env.PORT || 3004,
    dbhost: process.env.DBHOST || "157.230.150.194",
    db: process.env.DBNAME || "cornerstone",
    dbuser: process.env.DBUSER || "appuser",
    dbpass: process.env.DBPASS || "Pass123@$$123",
    jwt_secret: process.env.JWT_SECRET || "bjdb!@#$#fdfssdy328",
    session_secret: process.env.SESSION_SECRET || "duns3030!#$Aw",
  },

  production: {
    root: rootPath,
    app: {
      name: "cornerstone",
    },
    port: process.env.PORT || 3004,
    dbhost: process.env.DBHOST || "157.230.150.194",
    db: process.env.DBNAME || "cornerstone",
    dbuser: process.env.DBUSER || "appuser",
    dbpass: process.env.DBPASS || "Pass123@$$123",
    jwt_secret: process.env.JWT_SECRET || "bjdb!@#$#fdfssdy328",
    session_secret: process.env.SESSION_SECRET || "duns3030!#$Aw",
  },
};

module.exports = config[env];
