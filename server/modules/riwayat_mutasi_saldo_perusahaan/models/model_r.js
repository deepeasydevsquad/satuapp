const { Op, Transaction_deposit_company } = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
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
          [Op.or]: [
            { transaction_code: { [Op.like]: "%" + body.search + "%" } },
          ],
        },
      };
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "transaction_code",
      "nominal",
      "type_transaction",
      "ket",
      "status",
      "updatedAt",
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql);
      const q = await Transaction_deposit_company.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Transaction_deposit_company.findAll(query.sql).then(
          async (value) => {
            await Promise.all(
              await value.map(async (e) => {
                data.push({
                  id: e.id,
                  transaction_code: e.transaction_code,
                  nominal: e.nominal,
                  type_transaction: e.type_transaction,
                  ket: e.ket,
                  status: e.status,
                  updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
                });
              })
            );
          }
        );
      }

      return {
        data: data,
        total: total,
      };
    } catch (error) {
      return {};
    }
  }
}

module.exports = Model_r;
