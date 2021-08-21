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
        roleType: {
            type: DataTypes.STRING,
            defaultValue: "admin", //admin, secretary,treasurer
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
