module.exports = {
    apps : [{
        name: "cornerstone",
        script: "./bin/www",
        env: {
            NODE_ENV: "production",
            DBHOST: "213.52.128.176",
            PORT: 3000,
            DBNAME: "cornerstone",
            DBUSER: "admin",
            DBPASS: "passmixthsNyf7OQ7rw2tH6k"
        }
    }]
};