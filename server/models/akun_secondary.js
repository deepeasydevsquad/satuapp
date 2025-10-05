'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Akun_secondary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Akun_secondary.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Akun_secondary.belongsTo(models.Akun_primary, {
        foreignKey: "akun_primary_id",
      });
      Akun_secondary.hasMany(models.Saldo_akun, {
        foreignKey: "akun_secondary_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Akun_secondary.init({
    company_id: DataTypes.INTEGER,
    akun_primary_id: DataTypes.INTEGER,
    nomor_akun: DataTypes.STRING,
    nama_akun: DataTypes.STRING,
    tipe_akun: DataTypes.ENUM(['bawaan', 'tambahan']),
    path: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Akun_secondary',
  });
  return Akun_secondary;
};