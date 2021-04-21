module.exports = {
    apps : [{
        name: "cornerstone",
        script: "./bin/www",
        env: {
            NODE_ENV: "production",
            PORT: 3000,
            DBPASS: "Pass123@$$123",
            JWT_SECRET : "123joisuiu"
        }
    }]
};