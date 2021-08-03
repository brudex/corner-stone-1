module.exports = (sequelize, DataTypes) => {
  const UserChurches = sequelize.define(
    "UserChurches",
    {
      userId: DataTypes.INTEGER,
      churchId: DataTypes.INTEGER,
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "UserChurches",
      classMethods: {
        associate: (models) => {},
      },
    }
  );
  return UserChurches;
};
