module.exports = {
    apps : [{
        name: "cornerstone",
        script: "./bin/www",
        env: {
            NODE_ENV: "production",
            DBHOST: "localhost",
            PORT: 3000,
            DBNAME: "cornerstone",
            DBUSER: "admin",
            DBPASS: "pass"

        }
    }]
};