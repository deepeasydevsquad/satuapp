'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Paket.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Paket.belongsTo(models.Mst_provider, {
        foreignKey: "provider_visa_id",
      });
      Paket.belongsTo(models.Mst_asuransi, {
        foreignKey: "asuransi_id",
      });
      Paket.hasMany(models.Paket_price, {
        foreignKey: "paket_id",
        onDelete: 'CASCADE',
      });
      Paket.hasMany(models.Tabungan, {
        foreignKey: "target_paket_id",
        onDelete: 'CASCADE',
      });
      Paket.hasMany(models.Paket_transaction, {
        foreignKey: "paket_id",
        onDelete: 'CASCADE',
      });
      Paket.hasMany(models.Ticket_transaction, {
        foreignKey: "paket_id",
        onDelete: 'CASCADE',
      });
      Paket.hasMany(models.Hotel_transaction, {
        foreignKey: "paket_id",
        onDelete: 'CASCADE',
      });
      Paket.hasMany(models.Transport_transaction, {
        foreignKey: "paket_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Paket.init({
    division_id: DataTypes.INTEGER,
    jenis_kegiatan: DataTypes.ENUM(['haji', 'umrah', 'haji_umrah']),
    kode: DataTypes.STRING,
    photo: DataTypes.STRING,
    slug: DataTypes.TEXT,
    name: DataTypes.TEXT,
    description: DataTypes.TEXT,
    departure_date: DataTypes.DATEONLY,
    return_date: DataTypes.DATEONLY,
    departure_from: DataTypes.INTEGER,
    duration_trip: DataTypes.INTEGER,
    mahram_fee: DataTypes.INTEGER,
    quota_jamaah: DataTypes.INTEGER,
    city_visited: DataTypes.TEXT,
    airlines: DataTypes.TEXT,
    hotel: DataTypes.TEXT,
    facilities: DataTypes.TEXT,
    show_homepage: DataTypes.ENUM(['tampilkan', 'sembunyikan']),
    airport_departure: DataTypes.INTEGER,
    airport_destination: DataTypes.INTEGER,
    departure_time: DataTypes.DATE,
    arrival_time: DataTypes.DATE,
    tutup_paket: DataTypes.ENUM(['buka', 'tutup']),
    provider_visa_id: DataTypes.INTEGER,
    asuransi_id: DataTypes.INTEGER,
    no_polis: DataTypes.STRING,
    tgl_input_polis: DataTypes.DATEONLY,
    tgl_awal_polis: DataTypes.DATEONLY,
    tgl_akhir_polis: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'Paket',
  });
  return Paket;
};