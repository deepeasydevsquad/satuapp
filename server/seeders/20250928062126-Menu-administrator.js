"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ambil semua tab dari tabel Tabs
    const tabs = await queryInterface.sequelize.query(
      "SELECT id FROM Tab_administrators;",
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (tabs.length === 0) return;

    await queryInterface.bulkInsert(
      "Menu_administrators",
      [
        {
          id: 1,
          name: "Dashboard",
          path: "dashboard",
          icon: "fas fa-tachometer-alt",
          tab: `[{"id":"${tabs[0].id}"}]`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Perusahaan",
          path: "#",
          icon: "fas fa-building",
          tab: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "PPOB",
          path: "#",
          icon: "fas fa-bolt",
          tab: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Menu_administrators", null, {});
  },
};
