'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jurnal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Jurnal.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
    }
  }
  Jurnal.init({
    division_id: DataTypes.INTEGER,
    source: DataTypes.TEXT,
    ref: DataTypes.TEXT,
    ket: DataTypes.TEXT,
    akun_debet: DataTypes.INTEGER,
    akun_kredit: DataTypes.INTEGER,
    saldo: DataTypes.INTEGER,
    periode_id: DataTypes.INTEGER, 
    removable: DataTypes.ENUM(["true", "false"]),
  }, {
    sequelize,
    modelName: 'Jurnal',
  });
  return Jurnal;
};