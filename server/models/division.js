"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Division extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Division.hasMany(models.Saldo_akun, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Member, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Grup, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Division.hasMany(models.User, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Paket_la, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Paket, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Jurnal, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Jamaah, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.belongsTo(models.Mst_kota, {
        foreignKey: "kota_id",
      });
      Division.hasMany(models.Tabungan, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Ticket_transaction, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Whatsapp_message, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Paket_transaction, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Investor, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Ticket_rekapitulasi, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Ticket_reschedule_history, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Kas_keluar_masuk, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Peminjaman, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Skema_peminjaman, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Riwayat_pembayaran_peminjaman, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Deposit, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Pembayaran_fee_agen, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Pembayaran_gaji, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Riwayat_deposit_airline, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Visa_transaction, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Hotel_transaction, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Passport_transaction, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Transport_transaction, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Transaction_fasilitas, {
        foreignKey: "division_id",
        onDelete: "CASCADE",
      });
      Division.hasMany(models.Request_member, {
        foreignKey: "division_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Division.init(
    {
      company_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      kota_id: DataTypes.INTEGER,
      pos_code: DataTypes.STRING,
      address: DataTypes.TEXT,
      note: DataTypes.TEXT,
      tanda_tangan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Division",
    }
  );
  return Division;
};
