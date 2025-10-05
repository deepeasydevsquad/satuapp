"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const menus = await queryInterface.sequelize.query(
      "SELECT id FROM Menu_administrators;",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (menus.length === 0) return;

    // Ambil semua tab dari tabel Tabs
    const tabs = await queryInterface.sequelize.query(
      "SELECT id FROM Tab_administrators;",
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (tabs.length === 0) return;

    await queryInterface.bulkInsert(
      "Submenu_administrators",
      [
        {
          menu_administrator_id: menus[1].id,
          name: "Daftar Perusahaan",
          path: "daftar_perusahaan",
          tab: `[{"id":"${tabs[1].id}"}]`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          menu_administrator_id: menus[2].id,
          name: "Produk PPOB",
          path: "produk_ppob",
          tab: `[{"id":"${tabs[2].id}"},{"id":"${tabs[3].id}"}]`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          menu_administrator_id: menus[2].id,
          name: "Transaksi PPOB",
          path: "transaksi_ppob",
          tab: `[{"id":"${tabs[4].id}"},{"id":"${tabs[5].id}"}]`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Submenu_administrators", null, {});
  },
};
