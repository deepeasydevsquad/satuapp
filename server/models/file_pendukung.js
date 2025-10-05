'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class File_pendukung extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      File_pendukung.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      File_pendukung.belongsTo(models.Paket_transaction, {
        foreignKey: "paket_transaction_id",
      });
    }
  }
  File_pendukung.init({
    company_id: DataTypes.INTEGER,
    paket_transaction_id: DataTypes.INTEGER,
    title_file: DataTypes.STRING,
    filename: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'File_pendukung',
  });
  return File_pendukung;
};