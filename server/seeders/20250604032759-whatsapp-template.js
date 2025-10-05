"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Whatsapp_templates", [
      {
        company_id: 1,
        name: "Pesan Biasa",
        type: "pesan_biasa",
        message: "Ini pesan biasa tanpa variabel.",
        variable: JSON.stringify([]), // kosong
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        name: "Semua Jamaah",
        type: "semua_jamaah",
        message:
          "Halo {{nama_jamaah}}, nomor identitas kamu {{nomor_identitas}} dan sisa tenor {{sisa_tenor}} bulan.",
        variable: JSON.stringify([
          "{{nama_jamaah}}",
          "{{nomor_identitas}}",
          "{{sisa_tenor}}",
        ]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        name: "Staff",
        type: "staff",
        message: "Halo {{nama_staff}}, ada pesan baru buat kamu.",
        variable: JSON.stringify(["{{nama_staff}}"]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        name: "Agen",
        type: "agen",
        message: "Halo {{nama}}, level kamu {{level}} dan nomor HP {{no_hp}}.",
        variable: JSON.stringify(["{{nama}}", "{{level}}", "{{no_hp}}"]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        name: "Jamaah Paket",
        type: "jamaah_paket",
        message:
          "Paket kamu {{nama_paket}} (kode: {{kode_paket}}), nomor registrasi {{nomor_register}}, nama jamaah {{nama_jamaah}}, nomor identitas {{nomor_identitas}}.",
        variable: JSON.stringify([
          "{{nama_paket}}",
          "{{kode_paket}}",
          "{{nomor_register}}",
          "{{nama_jamaah}}",
          "{{nomor_identitas}}",
        ]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        name: "Jamaah Sudah Berangkat",
        type: "jamaah_sudah_berangkat",
        message:
          "Paket {{nama_paket}} ({{kode_paket}}), nomor register {{nomor_register}}, nama {{nama_jamaah}}, ID {{nomor_identitas}}, keberangkatan {{tanggal_keberangkatan}}, kepulangan {{tanggal_kepulangan}}.",
        variable: JSON.stringify([
          "{{nama_paket}}",
          "{{kode_paket}}",
          "{{nomor_register}}",
          "{{nama_jamaah}}",
          "{{nomor_identitas}}",
          "{{tanggal_keberangkatan}}",
          "{{tanggal_kepulangan}}",
        ]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        name: "Jamaah Tabungan Umrah",
        type: "jamaah_tabungan_umrah",
        message:
          "Halo {{nama_jamaah}}, nomor identitas {{nomor_identitas}}, total tabungan kamu {{total_tabungan}}.",
        variable: JSON.stringify([
          "{{nama_jamaah}}",
          "{{nomor_identitas}}",
          "{{total_tabungan}}",
        ]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        name: "Jamaah Utang Koperasi",
        type: "jamaah_utang_koperasi",
        message:
          "Halo {{nama_jamaah}}, nomor identitas {{nomor_identitas}}, total utang {{total_utang}}, tenor {{total_tenor}}, sudah bayar {{sudah_bayar}}, sisa utang {{sisa_utang}}.",
        variable: JSON.stringify([
          "{{nama_jamaah}}",
          "{{nomor_identitas}}",
          "{{total_utang}}",
          "{{total_tenor}}",
          "{{sudah_bayar}}",
          "{{sisa_utang}}",
        ]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Whatsapp_templates", null, {});
  },
};
