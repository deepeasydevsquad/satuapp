const { Menu, Submenu, Grup, Division } = require("../../../models");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  // ✅ Ambil Semua Menu
  async getMenu() {
    try {
      const menu = await Menu.findAll({
        include: [
          {
            model: Submenu,
          },
        ],
      });

      return menu;
    } catch (error) {
      console.error("Error fetching menu:", error);
      throw new Error("Failed to fetch menu");
    }
  }

  // ✅ Ambil Semua Grup
  async list() {
    try {

      const body = this.req.body;
      const limit = body.perpage || 10;
      const page = body.pageNumber && body.pageNumber !== "0" ? body.pageNumber : 1;


      const sql = 
      {
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        attributes: ["id", "name", "group_access", "createdAt", "updatedAt"],
        order: [["id", "ASC"]],
        include: [
          {
            model: Division,
            as: "Division", // Pastikan alias sesuai dengan yang didefinisikan di model
            attributes: ["name"],
          },
        ],
        
      }

      const q = await Grup.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        data = q.rows.map((e) => ({
          id: e.id,
          division: e.Division ? e.Division.name : null, // Gunakan alias yang benar
          name: e.name,
          group_access: JSON.parse(e.group_access || "[]"), // Pastikan JSON tidak null
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        }));
      }

      return { data: data, total: total };
    } catch (error) {
      console.error("Error fetching grups:", error); // Tambahkan logging untuk debugging
      return { success: false, error: error.message };
    }
  }
}

module.exports = Model_r;
