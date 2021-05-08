const path = require("path");
const rootPath = path.normalize(__dirname + "/..");
const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    root: rootPath,
    app: {
      name: "cornerstone",
    },
    port: process.env.PORT || 3000,
    dbhost: process.env.DBHOST || "157.230.150.194",
    db: process.env.DBNAME || "cornerstone",
    dbuser: process.env.DBUSER || "appuser",
    dbpass: process.env.DBPASS || "Pass123@$$123",
    jwt_secret: process.env.JWT_SECRET || "bjdb!@#$#fdfssdy328",
    session_secret: process.env.SESSION_SECRET || "duns3030!#$Aw",
    stripe_apiKey:
      process.env.SESSION_SECRET || "sk_test_4eC39HqLyjWDarjtT1zdp7dc",
    firebase_cloud_api_key:
      "key=AAAA5_xxpEE:APA91bETYeE89n0F4Ny2BrlrFfzFFi9jWmwj-bdk3UMOxdVp_OnyukR1wlUdRXIeP_4IAjzEnqmVz3wQ1l_p_PSrhDglWUJ74D5gojeBohJLaCq2CU7IlMspcj_r6z9Pr9ovvUv3HOG0",
  },

  test: {
    root: rootPath,
    app: {
      name: "cornerstone",
    },
    port: process.env.PORT || 3000,
    dbhost: process.env.DBHOST || "157.230.150.194",
    db: process.env.DBNAME || "cornerstone",
    dbuser: process.env.DBUSER || "appuser",
    dbpass: process.env.DBPASS || "Pass123@$$123",
    jwt_secret: process.env.JWT_SECRET || "bjdb!@#$#fdfssdy328",
    session_secret: process.env.SESSION_SECRET || "duns3030!#$Aw",
    stripe_apiKey:
      process.env.SESSION_SECRET || "sk_test_4eC39HqLyjWDarjtT1zdp7dc",
    firebase_cloud_api_key:
      "key=AAAA5_xxpEE:APA91bETYeE89n0F4Ny2BrlrFfzFFi9jWmwj-bdk3UMOxdVp_OnyukR1wlUdRXIeP_4IAjzEnqmVz3wQ1l_p_PSrhDglWUJ74D5gojeBohJLaCq2CU7IlMspcj_r6z9Pr9ovvUv3HOG0",
  },

  production: {
    root: rootPath,
    app: {
      name: "cornerstone",
    },
    port: process.env.PORT || 3000,
    dbhost: process.env.DBHOST || "157.230.150.194",
    db: process.env.DBNAME || "cornerstone",
    dbuser: process.env.DBUSER || "appuser",
    dbpass: process.env.DBPASS || "Pass123@$$123",
    jwt_secret: process.env.JWT_SECRET || "bjdb!@#$#fdfssdy328",
    session_secret: process.env.SESSION_SECRET || "duns3030!#$Aw",
    stripe_apiKey:
      process.env.SESSION_SECRET || "sk_test_4eC39HqLyjWDarjtT1zdp7dc",
    firebase_cloud_api_key:
      "key=AAAA5_xxpEE:APA91bETYeE89n0F4Ny2BrlrFfzFFi9jWmwj-bdk3UMOxdVp_OnyukR1wlUdRXIeP_4IAjzEnqmVz3wQ1l_p_PSrhDglWUJ74D5gojeBohJLaCq2CU7IlMspcj_r6z9Pr9ovvUv3HOG0",
  },
};

module.exports = config[env];
