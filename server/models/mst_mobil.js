'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_mobil extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_mobil.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Mst_mobil.hasMany(models.Transport_transaction_detail, {
        foreignKey: "mst_mobil_id",
        onDelete: "CASCADE",
      });
    }
  }
  Mst_mobil.init({
    company_id: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Mst_mobil',
  });
  return Mst_mobil;
};