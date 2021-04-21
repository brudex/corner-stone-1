module.exports = {
    apps : [{
        name: "cornerstone",
        script: "./app.js",
        env: {
            NODE_ENV: "production",
            PORT: 3000,
            DBPASS: "Pass123@$$123",
            JWT_SECRET : "123joisuiu"
        }
    }]
};