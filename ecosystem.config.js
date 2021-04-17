module.exports = {
    apps : [{
        name: "cornerstone",
        script: "./app.js",
        env: {
            NODE_ENV: "production",
            PORT: 3005,
            DBPASS: "Pass123@$$123",
        }
    }]
};