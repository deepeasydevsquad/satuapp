const fs = require("fs");
const path = require("path");

const {
  Member,
  Deposit,
  Company,
  sequelize,
  Sequelize,
  Division,
} = require("../../../models");
const { Op } = require("sequelize");
const { getCompanyIdByCode, tipe } = require("../../../helper/companyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    console.log("company_id =>", this.company_id);
  }

  async generateInvoice() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    let huruf = "";
    let angka = "";

    for (let i = 0; i < 3; i++) {
      huruf += letters.charAt(Math.floor(Math.random() * letters.length));
      angka += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return huruf + angka; // Contoh: "ABC123"
  }

  async dataCompany() {
    await this.initialize();

    var data = {};
    await Company.findOne({
      where: { id: this.company_id },
      include: [{ model: Division }],
    }).then(async (e) => {
      if (e) {
        // data["id"] = e.id;
        // data["kode"] = e.kode;
        // data["name"] = e.name;
      }
    });

    if (!company) {
      console.log("Company dengan ID ini gak ditemukan:", this.company_id);
      throw new Error("Data company tidak ditemukan");
    }

    return company;
  }

  async daftarDeposit() {
    const body = this.req.body;
    var limit = body.perpage || 10;
    var page = body.pageNumber || 1;

    var where = {};

    // ✅ Filter cabang
    if (body.cabang) {
      where.division_id = body.cabang;
    }

    if (body.search != undefined && body.search != "") {
      where = {
        [Op.or]: [
          Sequelize.literal(`\`Deposit\`.\`invoice\` LIKE '%${body.search}%'`),
          Sequelize.literal(`\`Member\`.\`fullname\` LIKE '%${body.search}%'`),
        ],
      };
    }

    var sql = {
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["id", "ASC"]],
      attributes: [
        "id",
        "nominal",
        "saldo_sebelum",
        "saldo_sesudah",
        "penerima",
        "invoice",
        "createdAt",
        "updatedAt",
      ],
      where,
      include: [
        {
          model: Member,
          attributes: ["fullname"],
          as: "Member",
        },
      ],
    };

    try {
      const { count, rows } = await Deposit.findAndCountAll(sql);
      var data = [];
      await Promise.all(
        await rows.map(async (e) => {
          data.push({
            id: e.id,
            nominal: e.nominal,
            fullname: e.Member.fullname,
            saldo_sebelum: e.saldo_sebelum,
            saldo_sesudah: e.saldo_sesudah,
            penerima: e.penerima,
            invoice: e.invoice,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
          });
        })
      );
      return { data: data, total: count };
    } catch (error) {
      console.error("Error fetching deposits:", error);
      return { data: [], total: 0 };
    }
  }

  async infoDeposit() {
    const { id } = this.req.body;

    try {
      const dataDeposit = await Deposit.findOne({
        where: { id },
        include: [{ model: Member, attributes: ["fullname"], as: "Member" }],
      });
      return dataDeposit || {};
    } catch (error) {
      console.error("Error fetching data deposit info:", error);
      return {};
    }
  }

  async daftar_member() {
    const body = this.req.body;
    const data = await Member.findAll({
      where: {
        division_id: body.id_cabang,
      },
      attributes: ["id", "fullname"],
    });

    const member = data.map((e) => ({
      id: e.id,
      name: e.fullname,
    }));
    return member;
  }
}

module.exports = Model_r;
