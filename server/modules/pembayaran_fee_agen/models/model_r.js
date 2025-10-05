const {
  Op,
  Agen,
  Pembayaran_fee_agen,
  Member,
  Fee_agen,
  Level_keagenan,
} = require("../../../models");
const {
  getCompanyIdByCode,
  tipe,
  getCabang,
} = require("../../../helper/companyHelper");
const { convertToRP } = require("../../../helper/currencyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.type;
    this.division;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.type = await tipe(this.req);
    this.division = await getCabang(this.req);
  }

  async daftar_pembayaran_fee_agen() {
    await this.initialize();
    const { body } = this.req;

    const limit = parseInt(body.perpage, 10) || 10;
    const page =
      parseInt(body.pageNumber, 10) > 0 ? parseInt(body.pageNumber, 10) : 1;
    const offset = (page - 1) * limit;

    let whereFee = {};
    let whereAgen = {};

    // ✅ Filter cabang
    if (body.cabang) {
      whereFee = {
        ...whereFee,
        division_id: body.cabang,
      };
    }

    // ✅ Filter search
    if (body.search) {
      whereAgen = {
        ...whereAgen,
        [Op.or]: [
          { fullname: { [Op.like]: `%${body.search}%` } },
          { "$Member.fullname$": { [Op.like]: `%${body.search}%` } },
        ],
      };
    }

    try {
      const result = await Agen.findAndCountAll({
        distinct: true,
        limit,
        offset,
        where: whereAgen,
        include: [
          {
            model: Pembayaran_fee_agen,
            required: true,
            where: whereFee,
            attributes: [
              "id",
              "invoice",
              "nominal",
              "applicant_name",
              "applicant_identity",
              "penerima",
            ],
          },
          {
            model: Member,
            required: true,
            attributes: ["fullname"],
          },
        ],
        order: [["id", "DESC"]],
      });

      const data = await Promise.all(
        result.rows.flatMap((item) => {
          return item.Pembayaran_fee_agens.map(async (pembayaran) => ({
            id: item.id,
            name: item.fullname || (item.Member?.fullname ?? "-"),
            id_pembayaran: pembayaran.id || "-",
            invoice: pembayaran.invoice || "-",
            nominal: await convertToRP(pembayaran.nominal),
            applicant_name: pembayaran.applicant_name || "-",
            applicant_identity: pembayaran.applicant_identity || "-",
            penerima: pembayaran.penerima || "-",
          }));
        })
      );

      return { data, total: result.count };
    } catch (error) {
      console.error("Error daftar_pembayaran_fee_agen:", error);
      return { data: [], total: 0 };
    }
  }

  async detail_fee_agen() {
    await this.initialize();
    const body = this.req.body;
    try {
      const sql = await Fee_agen.findAll({
        where: {
          pembayaran_fee_agen_id: body.id_pembayaran,
        },
        attributes: ["invoice", "nominal", "status_bayar", "info"],
      });

      if (!sql || sql.length === 0) return [];

      const data = await Promise.all(
        sql.map(async (item) => {
          return {
            invoice: item.invoice,
            nominal: await convertToRP(item.nominal),
            status_bayar: item.status_bayar,
            info: item.info,
          };
        })
      );
      return data;
    } catch (error) {
      console.error("Error di detail_fee_agen:", error);
      throw error;
    }
  }

  async daftar_agen() {
    await this.initialize();
    const body = this.req.body;
    try {
      const sql = await Agen.findAll({
        attributes: ["id"],
        include: [
          {
            required: true,
            model: Member,
            where: {
              division_id: body.division_id,
            },
            attributes: ["fullname"],
          },
        ],
      });

      const data_agen = sql.map((item) => {
        return {
          id: item.id,
          name: item.Member.fullname,
        };
      });

      return data_agen;
    } catch (error) {
      console.error("Error di daftar_agen:", error);
      throw error;
    }
  }

  async fee_agen_by_id() {
    await this.initialize();
    const body = this.req.body;
    try {
      const sql = await Fee_agen.findAll({
        where: {
          agen_id: body.agen_id,
          company_id: this.company_id,
          status_bayar: "belum_lunas",
        },
      });

      if (!sql || sql.length === 0) return [];

      const data = await Promise.all(
        sql.map(async (item) => {
          return {
            id: item.id,
            nominal: await convertToRP(item.nominal),
            status: item.status,
            info: item.info,
          };
        })
      );

      return data;
    } catch (error) {
      console.error("Error di fee_agen_by_id:", error);
      throw error;
    }
  }
}

module.exports = Model_r;
