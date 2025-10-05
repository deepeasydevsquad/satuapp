"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Menu_administrator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Menu_administrator.hasMany(models.Submenu_administrator, {
        foreignKey: "menu_administrator_id",
        onDelete: "CASCADE",
      });
    }
  }
  Menu_administrator.init(
    {
      name: DataTypes.STRING,
      path: DataTypes.STRING,
      icon: DataTypes.STRING,
      tab: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Menu_administrator",
    }
  );
  return Menu_administrator;
};
