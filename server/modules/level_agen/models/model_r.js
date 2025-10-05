const { Level_keagenan, Agen, Division, Member } = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");
const { Op } = require("sequelize");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async list() {
    
    await this.initialize();

    const body = this.req.body;
    const limit = body.perpage || 10;
    const page = body.pageNumber && body.pageNumber !== "0" ? body.pageNumber : 1;

    let where = { company_id : this.company_id };

    if (body.search) {
      where = {
        ...where,
        [Op.or]: [
          { name: { [Op.like]: `%${body.search}%` } },
        ],
      };
    }

    const sql = {
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["id", "ASC"]],
      attributes: [
        "id",
        "name",
        "level",
        "default_fee",
        "createdAt",
        "updatedAt",
      ],
      where: where,
    };

    try {
      const q = await Level_keagenan.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        data = q.rows.map((e) => ({
          id: e.id,
          name: e.name,
          level: e.level,
          default_fee: e.default_fee,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        }));
      }

      return { data: data, total: total };
    } catch (error) {
      console.log("******************");
      console.log(error);
      console.log("******************");
      return { data: [], total: 0 };
    }
  }

  async infoAgen(id, company_id) {
    try {
      var data = {};
      await Level_keagenan.findOne({
        where: { id: id },
      }).then(async (e) => {
        if (e) {
          data["id"] = e.id;
          data["name"] = e.name;
        }
      });

      return data;
    } catch (error) {
      return {};
    }
  }
}

module.exports = Model_r;
