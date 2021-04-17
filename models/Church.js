module.exports = (sequelize, DataTypes) => {
  const Church = sequelize.define(
    "User",
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      image: DataTypes.STRING,
    },
    {
      tableName: "User",
      classMethods: {
        associate: (models) => {},
      },
    }
  );
  return Church;
};
