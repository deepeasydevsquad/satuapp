'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Default_akun_secondary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Default_akun_secondary.belongsTo(models.Akun_primary, {
        foreignKey: "akun_primary_id",
      });
    }
  }
  Default_akun_secondary.init({
    akun_primary_id: DataTypes.INTEGER,
    nomor_akun: DataTypes.INTEGER,
    nama_akun: DataTypes.STRING,
    tipe: DataTypes.ENUM(["bawaan", "tambahan"]),
    path: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Default_akun_secondary',
  });
  return Default_akun_secondary;
};

// tipe: {
//   type: Sequelize.ENUM,
//   values: ["bawaan", "tambahan"],
//   defaultValue : "bawaan"
// },