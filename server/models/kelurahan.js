'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kelurahan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kelurahan.belongsTo(models.Kecamatan, {
        foreignKey: "kecamatan_id",
      });
      Kelurahan.hasMany(models.Jamaah, {
        foreignKey: "kelurahan_id",
        onDelete: 'CASCADE',
      });
      Kelurahan.hasMany(models.Request_member, {
        foreignKey: "kelurahan_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Kelurahan.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    kecamatan_id: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Kelurahan',
  });
  return Kelurahan;
};