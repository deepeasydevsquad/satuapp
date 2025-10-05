'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Akun_primary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Akun_primary.hasMany(models.Akun_secondary, {
        foreignKey: "akun_primary_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Akun_primary.init({
    nomor_akun: DataTypes.INTEGER,
    nama_akun: DataTypes.STRING,
    sn: DataTypes.STRING,
    pos: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Akun_primary',
  });
  return Akun_primary;
};