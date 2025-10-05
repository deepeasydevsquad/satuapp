'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      User.belongsTo(models.Member, {
        foreignKey: "member_id",
      });
      User.belongsTo(models.Grup, {
        foreignKey: "grup_id",
      });
      User.hasMany(models.Pembayaran_gaji, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
      });
    }
  }
  User.init({
    division_id: DataTypes.INTEGER,
    member_id: DataTypes.INTEGER,
    grup_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};