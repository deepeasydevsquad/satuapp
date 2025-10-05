"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Submenu_administrator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Submenu_administrator.belongsTo(models.Menu, {
        foreignKey: "menu_administrator_id",
      });
    }
  }
  Submenu_administrator.init(
    {
      menu_administrator_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      path: DataTypes.STRING,
      tab: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Submenu_administrator",
    }
  );
  return Submenu_administrator;
};
