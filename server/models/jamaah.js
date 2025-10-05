'use strict';
const {
  Model
} = require('sequelize');
const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jamaah extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Jamaah.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Jamaah.belongsTo(models.Agen, {
        foreignKey: "agen_id",
      });
      Jamaah.belongsTo(models.Member, {
        foreignKey: "member_id",
      });
      Jamaah.belongsTo(models.Kelurahan, {
        foreignKey: "kelurahan_id",
      });
      Jamaah.belongsTo(models.Mst_pendidikan, {
        foreignKey: "last_education",
      });
      Jamaah.belongsTo(models.Mst_pekerjaan, {
        foreignKey: "mst_pekerjaan_id",
      });

      Jamaah.hasMany(models.Mahram, {
        foreignKey: "jamaah_id",
        onDelete: 'CASCADE',
      });
      Jamaah.hasMany(models.Peminjaman, {
        foreignKey: "jamaah_id",
        onDelete: 'CASCADE',
      });
      Jamaah.hasMany(models.Tabungan, {
        foreignKey: "jamaah_id",
        onDelete: 'CASCADE',
      });
      Jamaah.hasMany(models.Handover_barang, {
        foreignKey: "jamaah_id",
        onDelete: 'CASCADE',
      });
      Jamaah.hasMany(models.Handover_barang_paket, {
        foreignKey: "jamaah_id",
        onDelete: 'CASCADE',
      });
      Jamaah.hasMany(models.Paket_transaction, {
        foreignKey: "jamaah_id",
        onDelete: 'CASCADE',
      });
    }
  }

  Jamaah.init({
    division_id: DataTypes.INTEGER,
    agen_id: DataTypes.INTEGER,
    member_id: DataTypes.INTEGER,
    kelurahan_id: DataTypes.BIGINT,
    address: DataTypes.TEXT,
    title: DataTypes.ENUM(["tuan", "nona", "nyonya"]),
    nama_ayah: DataTypes.STRING,
    nama_passport: DataTypes.STRING,
    nomor_passport: DataTypes.STRING,
    tanggal_di_keluarkan_passport: DataTypes.DATE,
    tempat_di_keluarkan_passport: DataTypes.STRING,
    masa_berlaku_passport: DataTypes.DATE,
    kode_pos: DataTypes.STRING,
    nomor_telephone: DataTypes.STRING,
    email: DataTypes.STRING,
    pengalaman_haji: DataTypes.INTEGER,
    tahun_haji: { type: DataTypes.INTEGER, validate: { min: 1900, max: 2100 } },
    pengalaman_umrah: DataTypes.INTEGER,
    tahun_umrah: { type: DataTypes.INTEGER, validate: { min: 1900, max: 2100 } },
    desease: DataTypes.STRING,
    last_education: DataTypes.INTEGER,
    blood_type: DataTypes.STRING,
    photo_4_6: DataTypes.ENUM(["ada", "tidak_ada"]),
    photo_3_4: DataTypes.ENUM(["ada", "tidak_ada"]),
    fc_passport: DataTypes.ENUM(["ada", "tidak_ada"]),
    mst_pekerjaan_id: DataTypes.INTEGER,
    profession_instantion_name: DataTypes.STRING,
    profession_instantion_address: DataTypes.STRING,
    profession_instantion_telephone: DataTypes.STRING,
    fc_kk: DataTypes.ENUM(["ada", "tidak_ada"]),
    fc_ktp: DataTypes.ENUM(["ada", "tidak_ada"]),
    buku_nikah: DataTypes.ENUM(["ada", "tidak_ada"]),
    akte_lahir: DataTypes.ENUM(["ada", "tidak_ada"]),
    buku_kuning: DataTypes.ENUM(["ada", "tidak_ada"]),
    keterangan: DataTypes.TEXT,
    nama_keluarga: DataTypes.STRING,
    alamat_keluarga: DataTypes.TEXT,
    telephone_keluarga: DataTypes.STRING,
    status_nikah: DataTypes.ENUM(["menikah", "belum_menikah","janda_duda"]),
    tanggal_nikah: DataTypes.DATE,
    kewarganegaraan: DataTypes.ENUM(["wni", "wna"])
  }, {
    sequelize,
    modelName: 'Jamaah',
  });
  return Jamaah;
};