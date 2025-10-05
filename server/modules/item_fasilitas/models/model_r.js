const { Op, Mst_fasilitas, Item_fasilitas } = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null;
    this.division_id = null;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async daftar_item() {
    await this.initialize();

    const body = this.req.body;
    const limit = parseInt(body.perpage) || 10;
    const page =
      body.pageNumber && body.pageNumber !== "0"
        ? parseInt(body.pageNumber)
        : 1;

    let where = { division_id: body.cabang};

    if (body.search && body.search !== "") {
      where.name = { [Op.like]: `%${body.search}%` };
    }

    if ( body.status &&
      (body.status === "terjual" || body.status === "belum_terjual")
    ) {
      where.status = body.status;
    }

    console.log("WHERE Condition:", where);

    // 🔗 JOIN config
    const include = [
      {
        model: Mst_fasilitas,
        attributes: ["id", "name", "company_id"],
        where: { company_id: this.company_id },
      },
    ];

    // 📦 Final SQL query object
    const sql = {
      limit,
      offset: (page - 1) * limit,
      order: [["id", "ASC"]],
      attributes: ["id", "status", "harga_jual", "harga_beli", "createdAt", "updatedAt", "item_code"],
      where,
      include,
    };

    try {
      const q = await Item_fasilitas.findAndCountAll(sql);
      const total = q.count;
      const data = q.rows.map((item) => {
        const row = item.toJSON();
        return {
          id: row.id,
          item_code: row.item_code,
          status: row.status,
          harga_beli: row.harga_beli,
          harga_jual: row.harga_jual,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          fasilitas_name: row.Mst_fasilita?.name || null,
          fasilitas_company: row.Mst_fasilita?.company_id || null,
        };
      });
      return {
        data,
        total,
      };
    } catch (error) {
      console.error("🔥 ERROR in daftar_item:", error);
      return {
        data: [],
        total: 0,
      };
    }
  }
}

module.exports = Model_r;
