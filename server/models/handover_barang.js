'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Handover_barang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Handover_barang.belongsTo(models.Tabungan, {
        foreignKey: "tabungan_id",
      });
      Handover_barang.belongsTo(models.Jamaah, {
        foreignKey: "jamaah_id",
      });
    }
  }
  Handover_barang.init({
    tabungan_id: DataTypes.INTEGER,
    invoice_handover: DataTypes.STRING,
    invoice_returned: DataTypes.STRING,
    jamaah_id: DataTypes.INTEGER,
    nama_barang: DataTypes.STRING,
    status: DataTypes.ENUM(['dikembalikan','diambil']),
    giver_handover: DataTypes.STRING,
    giver_handover_identity: DataTypes.STRING,
    giver_handover_hp: DataTypes.STRING,
    giver_handover_address: DataTypes.TEXT,
    receiver_handover: DataTypes.STRING,
    giver_returned: DataTypes.STRING,
    receiver_returned: DataTypes.STRING,
    receiver_returned_identity: DataTypes.STRING,
    receiver_returned_hp: DataTypes.STRING,
    receiver_returned_address: DataTypes.TEXT,
    date_taken: DataTypes.DATE,
    date_returned: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Handover_barang',
  });
  return Handover_barang;
};