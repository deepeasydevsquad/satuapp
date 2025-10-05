const { System_log, Company, Division, Member, User, Op } = require("../../../models");
const { tipe, getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const moment = require("moment");

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

  async get_list_cabang_by_cabang_id(id) {
    const cabang = await Division.findOne({
      where: {
        id: id, 
        company_id: this.company_id
      },
    });
    return cabang.name;
  }

  /**
   * Mengambil data log travel dari tabel system_log.
   * @returns {Promise<Array>} - Array of formatted log data.
   * @throws {Error} - Jika terjadi error saat mengambil data.
   */
  async list() {

    await this.initialize();

    try {
      const body = this.req.body;
      const limit = body.perpage || 10;
      const page = body.pageNumber && body.pageNumber !== "0" ? body.pageNumber : 1;

      var list_user_id = [];
      var info_user = {};

      if( body.cabang == this.division && this.type == 'administrator') {
        list_user_id.push(0);
      }

      if (body.cabang != undefined && body.cabang != "") {
         await User.findAll({ 
          where: { 
            division_id : body.cabang 
          }, 
          include: { 
            required : true, 
            model: Member 
          }}).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              list_user_id.push(e.id);
              info_user = {...info_user,...{[e.id] : e.Member.fullname}};
            })
          );
        });
      }

      let where = { company_id : this.company_id, user_id: { [Op.in] : list_user_id} };

      if (body.search != undefined && body.search != "") {
        where = {...where,...{ 
          [Op.or]: [{ msg : { [Op.like]: "%" + body.search + "%" } }]
          }
        };
      }

      var cabangName = await this.get_list_cabang_by_cabang_id( body.cabang );

      const sql = {
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [["id", "ASC"]],
        attributes: [
          "id",
          "msg", 
          "user_id", 
          "log_ip", 
          "createdAt",
          "updatedAt",
        ],
        where: where,
      };

      const q = await System_log.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        data = q.rows.map((e) => ({
          id: e.id,
          logMsg: e.msg, 
          userName: e.user_id !== 0 ? info_user[e.user_id] : 'Administrator',
          transactionDate: e.createdAt, 
          logIpAccess : e.log_ip, 
          cabangName : cabangName
        }));
      }

      return { data: data, total: total };
    } catch (error) {
      console.error("Error fetching travel logs:", error);
      throw error;
    }
  }
}

module.exports = Model_r;
