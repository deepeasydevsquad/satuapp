const {
  Op,
  Request_member,
  Agen,
  Member,
  Company,
  Request_deposit_company,
  Akun_bank_administrator,
} = require("../../../models");
const {
  getCompanyIdByCode,
  getCabang,
  tipe,
} = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");
const moment = require("moment");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.tipe;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async list() {
    await this.initialize();
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== "0")
      page = body.pageNumber;

    let where = { company_id: this.company_id };

    if (body.search != undefined && body.search != "") {
      where = {
        ...where,
        ...{
          [Op.or]: [{ request_code: { [Op.like]: "%" + body.search + "%" } }],
        },
      };
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "request_code",
      "bank",
      "number_account_bank",
      "name_account_bank",
      "nominal",
      "nominal_code",
      "sending_payment_status",
      "sending_payment_time",
      "status",
      "status_node",
      "petugas",
      "updatedAt",
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql);
      const q = await Request_deposit_company.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Request_deposit_company.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data.push({
                id: e.id,
                request_code: e.request_code,
                bank: e.bank,
                number_account_bank: e.number_account_bank,
                name_account_bank: e.name_account_bank,
                nominal: e.nominal,
                nominal_code: e.nominal_code,
                sending_payment_status: e.sending_payment_status,
                status: e.status,
                status_node: e.status_node,
                petugas: e.petugas,
                sending_payment_time:
                  e.sending_payment_time == null
                    ? "-"
                    : moment(e.sending_payment_time).format(
                        "YYYY-MM-DD HH:mm:ss"
                      ),
                updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
              });
            })
          );
        });
      }

      return {
        data: data,
        total: total,
      };
    } catch (error) {
      console.log("------XXXXX`1111111111111-----");
      console.log(error);
      console.log("------XXXXX`1111111111111-----");
      return {};
    }
  }

  async listBankTransfer() {
    try {
      const value = await Akun_bank_administrator.findAll({
        attributes: [
          "id",
          "bank_name",
          "account_bank_name",
          "account_bank_number",
        ],
        order: [["id", "ASC"]],
      });
      const data = value.map((e) => ({
        id: e.id,
        name: `${e.bank_name} -> ${e.account_bank_name} | No Rek : ${e.account_bank_number}`,
      }));
      return { data, total: data.length };
    } catch (error) {
      console.log("------XXXXX`2222222222222-----");
      console.log(error);
      console.log("------XXXXX`2222222222222-----");
      return {};
    }
  }

  async get_info_edit() {
    await this.initialize();
    const body = this.req.body;
    let where = { company_id: this.company_id, id: body.id };

    try {
      const q = await Request_deposit_company.findOne({
        where: where,
        attributes: ["id", "bank", "nominal"],
      });
      if (!q) {
        return { data: {} };
      }

      const q2 = await Akun_bank_administrator.findOne({
        where: { bank_name: q.bank },
      });
      if (!q2) {
        return { data: {} };
      }

      const data = {
        bank_id: q2.id,
        nominal: q.nominal,
      };
      return { data };
    } catch (error) {
      console.log("------XXXXX`3333333333333-----");
      console.log(error);
      console.log("------XXXXX`3333333333333-----");
      return {};
    }
  }
}

module.exports = Model_r;
