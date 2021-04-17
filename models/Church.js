module.exports = (sequelize, DataTypes) => {
  const Church = sequelize.define(
    "Church",
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      image: DataTypes.STRING,
    },
    {
      tableName: "Church",
      classMethods: {
        associate: (models) => {},
      },
    }
  );
  return Church;
};
