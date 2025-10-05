'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pakets', {
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
      jenis_kegiatan: {
        type: Sequelize.ENUM,
        values: ['haji', 'umrah', 'haji_umrah'],
      },
      kode: {
        type: Sequelize.STRING
      },
      photo: {
        type: Sequelize.STRING
      },
      slug: {
        type: Sequelize.TEXT
      },
      name: {
        type: Sequelize.TEXT
      },
      description: {
        type: Sequelize.TEXT
      },
      departure_date: {
        type: Sequelize.DATEONLY
      },
      return_date: {
        type: Sequelize.DATEONLY
      },
      departure_from: {
        type: Sequelize.INTEGER
      },
      duration_trip: {
        type: Sequelize.INTEGER
      },
      mahram_fee: {
        type: Sequelize.INTEGER
      },
      quota_jamaah: {
        type: Sequelize.INTEGER
      },
      city_visited: {
        type: Sequelize.TEXT
      },
      airlines: {
        type: Sequelize.TEXT
      },
      hotel: {
        type: Sequelize.TEXT
      },
      facilities: {
        type: Sequelize.TEXT
      },
      show_homepage: {
        type: Sequelize.ENUM,
        values: ['tampilkan', 'sembunyikan'],
        defaultValue : "sembunyikan"
      },
      airport_departure: {
        type: Sequelize.INTEGER
      },
      airport_destination: {
        type: Sequelize.INTEGER
      },
      departure_time: {
        type: Sequelize.DATE
      },
      arrival_time: {
        type: Sequelize.DATE
      },
      tutup_paket: {
        type: Sequelize.ENUM,
        values: ['buka', 'tutup'],
        defaultValue : "buka"
      },
      provider_visa_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_providers",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      asuransi_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_asuransis",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      no_polis: {
        type: Sequelize.STRING
      },
      tgl_input_polis: {
        type: Sequelize.DATEONLY
      },
      tgl_awal_polis: {
        type: Sequelize.DATEONLY
      },
      tgl_akhir_polis: {
        type: Sequelize.DATEONLY
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
    await queryInterface.dropTable('Pakets');
  }
};