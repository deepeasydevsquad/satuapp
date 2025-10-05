'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    // Ambil semua menu dari tabel Menus
    const menus = await queryInterface.sequelize.query(
      'SELECT id FROM Menus;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (menus.length === 0) return;

    // Ambil semua tab dari tabel Tabs
    const tabs = await queryInterface.sequelize.query(
      'SELECT id FROM Tabs;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (tabs.length === 0) return;

    await queryInterface.bulkInsert('Submenus', [
      { menu_id : menus[1].id, name: 'Transaksi Tiket', path: 'transaksi_tiket', tab:`[{"id":"${tabs[1].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[1].id, name: 'Transaksi Paket', path: 'transaksi_paket', tab:`[{"id":"${tabs[0].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[1].id, name: 'Transaksi Umum', path: 'transaksi_umum', tab:`[{"id":"${tabs[16].id}"},{"id":"${tabs[17].id}"},{"id":"${tabs[18].id}"},{"id":"${tabs[19].id}"},{"id":"${tabs[20].id}"},{"id":"${tabs[65].id}"},{"id":"${tabs[59].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[1].id, name: 'Rekapitulasi', path: 'rekapitulasi', tab:`[{"id":"${tabs[21].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[1].id, name: 'Stok', path: 'stok', tab:`[{"id":"${tabs[57].id}"},{"id":"${tabs[58].id}"},{"id":"${tabs[67].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[2].id, name: 'Daftar Paket', path: 'daftar_paket', tab:`[{"id":"${tabs[4].id}"},{"id":"${tabs[5].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[2].id, name: 'Daftar Paket LA', path: 'daftar_paket_la', tab:`[{"id":"${tabs[9].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[3].id, name: 'Daftar Member', path: 'daftar_member', tab:`[{"id":"${tabs[23].id}"},{"id":"${tabs[68].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[3].id, name: 'Deposit & Tabungan', path: 'deposit_tabungan', tab:`[{"id":"${tabs[3].id}"},{"id":"${tabs[43].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[3].id, name: 'Daftar Jamaah', path: 'daftar_jamaah', tab:`[{"id":"${tabs[24].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[3].id, name: 'Daftar Agen', path: 'daftar_agen', tab:`[{"id":"${tabs[26].id}"},{"id":"${tabs[56].id}"},{"id":"${tabs[42].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[3].id, name: 'Daftar Kostumer', path: 'kostumer', tab: `[{"id":"${tabs[10].id}"}]` ,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[3].id, name: 'Pinjaman', path: 'pinjaman', tab:`[{"id":"${tabs[47].id}"},{"id":"${tabs[54].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[3].id, name: 'Whatsapp', path: 'whatsapp', tab:`[{"id":"${tabs[48].id}"},{"id":"${tabs[49].id}"},{"id":"${tabs[50].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[3].id, name: 'Surat Menyurat', path: 'surat_menyurat', tab:`[{"id":"${tabs[51].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[3].id, name: 'PPOB', path: 'ppob', tab:`[{"id":"${tabs[55].id}"},{"id":"${tabs[60].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[4].id, name: 'Mobile', path: 'mobile', tab:`[{"id":"${tabs[61].id}"},{"id":"${tabs[62].id}"},{"id":"${tabs[66].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[5].id, name: 'Supplier', path: 'supplier', tab:`[{"id":"${tabs[11].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[5].id, name: 'Bank', path: 'bank', tab:`[{"id":"${tabs[6].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[5].id, name: 'Maskapai', path: 'maskapai', tab:`[{"id":"${tabs[7].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[5].id, name: 'Fasilitas', path: 'fasilitas', tab:`[{"id":"${tabs[8].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[5].id, name: 'Daftar Hotel', path: 'daftar_hotel', tab:`[{"id":"${tabs[14].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[5].id, name: 'Jenis Mobil', path: 'jenis_mobil', tab:`[{"id":"${tabs[13].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[5].id, name: 'Daftar Kota', path: 'daftar_kota', tab:`[{"id":"${tabs[12].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[5].id, name: 'Daftar Bandara', path: 'daftar_bandara', tab:`[{"id":"${tabs[41].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[5].id, name: 'Daftar Provider Visa', path: 'daftar_provider_visa', tab:`[{"id":"${tabs[45].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[5].id, name: 'Daftar Asuransi', path: 'daftar_asuransi', tab:`[{"id":"${tabs[46].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[6].id, name: 'Akun', path: 'akun', tab:`[{"id":"${tabs[33].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[6].id, name: 'Investor', path: 'investor', tab:`[{"id":"${tabs[39].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[6].id, name: 'Jurnal', path: 'jurnal', tab:`[{"id":"${tabs[15].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[6].id, name: 'Buku Besar', path: 'buku_besar', tab:`[{"id":"${tabs[34].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[6].id, name: 'Neraca Lajur', path: 'neraca_lajur', tab:`[{"id":"${tabs[35].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[6].id, name: 'Laba Rugi', path: 'laba_rugi', tab:`[{"id":"${tabs[36].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[6].id, name: 'Neraca', path: 'neraca', tab:`[{"id":"${tabs[37].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[6].id, name: 'Modal', path: 'modal', tab:`[{"id":"${tabs[38].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[7].id, name: 'Pengaturan', path: 'pengaturan', tab:`[{"id":"${tabs[30].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[7].id, name: 'Cabang', path: 'cabang', tab:`[{"id":"${tabs[53].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[7].id, name: 'Grup Pengguna', path: 'grup_pengguna', tab:`[{"id":"${tabs[31].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[7].id, name: 'Pengguna', path: 'pengguna', tab:`[{"id":"${tabs[32].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[7].id, name: 'System Log', path: 'system_log', tab:`[{"id":"${tabs[29].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
      { menu_id : menus[7].id, name: 'Saldo Perusahaan', path: 'saldo_perusahaan', tab:`[{"id":"${tabs[63].id}"},{"id":"${tabs[64].id}"}]`,  createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Submenus', null, {});
  }
};
