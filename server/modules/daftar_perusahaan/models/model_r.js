const { Op, Company } = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");
const moment = require("moment");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  async list() {
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== "0")
      page = body.pageNumber;

    var where = {};

    if (body.search != undefined && body.search != "") {
      where = {
        ...where,
        ...{
          [Op.or]: [
            { code: { [Op.like]: "%" + body.search + "%" } },
            { company_name: { [Op.like]: "%" + body.search + "%" } },
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
      "code",
      "company_name",
      "email",
      "type",
      "verify_status",
      "verify_time",
      "whatsapp_company_number",
      "start_subscribtion",
      "end_subscribtion",
      "saldo",
      "updatedAt",
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql);
      const q = await Company.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Company.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data.push({
                id: e.id,
                code: e.code,
                company_name: e.company_name,
                email: e.email,
                type: e.type,
                verify_status: e.verify_status,
                verify_time: e.verify_time,
                whatsapp_company_number: e.whatsapp_company_number,
                start_subscribtion: moment(e.start_subscribtion).format(
                  "YYYY-MM-DD"
                ),
                end_subscribtion:
                  e.end_subscribtion == null
                    ? ""
                    : moment(e.end_subscribtion).format("YYYY-MM-DD"),
                saldo: e.saldo,
                updatedAt: e.updatedAt,
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
      console.log("XXXXXX");
      console.log(error);
      console.log("XXXXXX");
      return {};
    }
  }

  async get_data_edit_perusahaan() {
    const body = this.req.body;
    try {
      var data = {};
      await Company.findOne({
        where: { id: body.id },
      }).then(async (e) => {
        if (e) {
          data["id"] = e.id;
          data["company_name"] = e.company_name;
          data["type"] = e.type;
          data["whatsapp_company_number"] = e.whatsapp_company_number;
          data["start_subscribtion"] = moment(e.start_subscribtion).format(
            "YYYY-MM-DD"
          );
          data["end_subscribtion"] =
            e.end_subscribtion != null
              ? moment(e.end_subscribtion).format("YYYY-MM-DD")
              : "-";
          data["durasi"] = e.durasi;
          data["email"] = e.email;
          data["saldo"] = e.saldo;
          data["username"] = e.username;
        }
      });
      return data;
    } catch (error) {
      console.log("xxxx");
      console.log(error);
      console.log("xxxx");
      return {};
    }
  }

  // body("company_name").trim(),
  // body("type")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Tipe tidak boleh kosong.")
  //   .isIn(["limited", "unlimited"])
  //   .withMessage("Format tipe perusahaan tidak ditemukan."),
  // body("whatsapp_company_number")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Nomor whatsapp tidak boleh kosong.")
  //   .custom(validation.check_nomor_whatsapp),
  // body("start_subscribtion").trim(),
  // body("end_subscribtion").trim(),
  // body("durasi").trim(),
  // body("email").trim().custom(validation.check_email_update),
  // body("saldo").trim(),
  // body("username").trim().custom(validation.check_username_update),

  // async infoKota(id, company_id) {
  //   try {
  //     var data = {};
  //     await Mst_kota.findOne({
  //         where: { id: id, company_id: company_id },
  //     }).then(async (e) => {
  //         if (e) {
  //             data["id"] = e.id;
  //             data["kode"] = e.kode;
  //             data["name"] = e.name;
  //         }
  //     });
  //     return data
  //   } catch (error) {
  //     return {}
  //   }
  // }
}

module.exports = Model_r;
