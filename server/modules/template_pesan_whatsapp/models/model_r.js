const { Whatsapp_template, sequelize } = require("../../../models");
const { Op } = require("sequelize");
const {
  getCompanyIdByCode,
  getCabang,
} = require("../../../helper/companyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.division_id;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async daftar_template() {
    await this.initialize();
    const templates = await Whatsapp_template.findAll({
      where: {
        company_id: this.company_id,
      },
      attributes: ["id", "name", "type", "message", "variable"],
      order: [["createdAt", "DESC"]],
    });

    const data = templates.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      message: item.message,
      variable: item.variable ? JSON.parse(item.variable) : [], // ← ini penting
    }));

    return data;
  }

  async get_template_by_id() {
    await this.initialize();
    const body = this.req.body;
    try {
      const template_by_id = await Whatsapp_template.findOne({
        where: {
          id: body.id,
          company_id: this.company_id,
        },
        attributes: ["id", "name", "type", "message", "variable"],
      });
      if (!template_by_id) return null;

      const data = {
        id: template_by_id.id,
        name: template_by_id.name,
        type: template_by_id.type,
        message: template_by_id.message,
        variable: template_by_id.variable
          ? JSON.parse(template_by_id.variable)
          : [],
      };

      return data;
    } catch (error) {
      console.error("Error get template by id:", error);
      throw error;
    }
  }
}

module.exports = Model_r;
