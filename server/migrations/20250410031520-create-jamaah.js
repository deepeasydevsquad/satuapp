'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    console.log("🚧 Migrating table Jamaah...");
    
    await queryInterface.createTable('Jamaahs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      division_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Divisions",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      agen_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Agens",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      member_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Members",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      kelurahan_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "Kelurahans",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      address: {
        type: Sequelize.TEXT
      },
      title: {
        type: Sequelize.ENUM,
        values: ["tuan", "nona", "nyonya"],
      },
      nama_ayah: {
        type: Sequelize.STRING
      },
      nama_passport: {
        type: Sequelize.STRING
      },
      nomor_passport: {
        type: Sequelize.STRING
      },
      tanggal_di_keluarkan_passport: {
        type: Sequelize.DATE
      },
      tempat_di_keluarkan_passport: {
        type: Sequelize.STRING
      },
      masa_berlaku_passport: {
        type: Sequelize.DATE
      },
      kode_pos: {
        type: Sequelize.STRING
      },
      nomor_telephone: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      pengalaman_haji: {
        type: Sequelize.INTEGER,
      },
      tahun_haji: {
        type: Sequelize.INTEGER
      },
      pengalaman_umrah: {
        type: Sequelize.INTEGER,
      },
      tahun_umrah: {
        type: Sequelize.INTEGER
      },
      desease: {
        type: Sequelize.STRING
      },
      last_education: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_pendidikans",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      blood_type: {
        type: Sequelize.STRING
      },
      photo_4_6: {
        type: Sequelize.ENUM,
        values: ["ada", "tidak_ada"],
        defaultValue : "tidak_ada"
      },
      photo_3_4: {
        type: Sequelize.ENUM,
        values: ["ada", "tidak_ada"],
        defaultValue : "tidak_ada"
      },
      fc_passport: {
        type: Sequelize.ENUM,
        values: ["ada", "tidak_ada"],
        defaultValue : "tidak_ada"
      },
      mst_pekerjaan_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_pekerjaans",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      profession_instantion_name: {
        type: Sequelize.STRING
      },
      profession_instantion_address: {
        type: Sequelize.STRING
      },
      profession_instantion_telephone: {
        type: Sequelize.STRING
      },
      fc_kk: {
        type: Sequelize.ENUM,
        values: ["ada", "tidak_ada"],
        defaultValue : "tidak_ada"
      },
      fc_ktp: {
        type: Sequelize.ENUM,
        values: ["ada", "tidak_ada"],
        defaultValue : "tidak_ada"
      },
      buku_nikah: {
        type: Sequelize.ENUM,
        values: ["ada", "tidak_ada"],
        defaultValue : "tidak_ada"
      },
      akte_lahir: {
        type: Sequelize.ENUM,
        values: ["ada", "tidak_ada"],
        defaultValue : "tidak_ada"
      },
      buku_kuning: {
        type: Sequelize.ENUM,
        values: ["ada", "tidak_ada"],
        defaultValue : "tidak_ada"
      },
      keterangan: {
        type: Sequelize.TEXT
      },
      nama_keluarga: {
        type: Sequelize.STRING
      },
      alamat_keluarga: {
        type: Sequelize.TEXT
      },
      telephone_keluarga: {
        type: Sequelize.STRING
      },
      status_nikah: {
        type: Sequelize.ENUM,
        values: ["menikah", "belum_menikah", "janda_duda"],
        defaultValue : "belum_menikah"
      },
      tanggal_nikah: {
        type: Sequelize.DATE
      },
      kewarganegaraan: {
        type: Sequelize.ENUM,
        values: ["wni", "wna"],
        defaultValue : "wni"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Jamaahs');
  }
};