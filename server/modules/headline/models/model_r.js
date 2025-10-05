const {
  Op,
  Headline,
  sequelize,
} = require("../../../models");
const { getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const {dbList} = require("../../../helper/dbHelper");
const moment = require("moment");

class Model_r {

  constructor(req) {
    this.req = req;
    this.company_id = null;
    this.division_id = null;
  }

  async initialize() {
    // Avoid re-initializing if already done
    if (this.company_id && this.division_id) {
      return;
    }
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
  }

  async daftarHeadline() {
    await this.initialize();
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    var where = { company_id : this.company_id };
        
    if (body.search != undefined && body.search != "") {
      where = {...where,...{ 
        [Op.or]: [{ headline : { [Op.like]: "%" + body.search + "%" } }]
      }};
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "headline",
      "tampilkan",
      "updatedAt",
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql);
      const q = await Headline.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Headline.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data.push({ 
                id : e.id, 
                headline : e.headline,
                tampilkan : e.tampilkan
              });
            })
          );
        });
      }

      return { 
        data: data, 
        total: total
      };
    } catch (error) {
      console.error("Error in daftarHeadline:", error);
      return { data: [], total: 0 };
    }
  }

  async fetchHeadline() {
    await this.initialize();
    const body = this.req.body;
    
    try {
      const dataHeadline = await Headline.findOne({ where: { id: body.id } });

      const data = {
        id: dataHeadline.id,
        headline: dataHeadline.headline,
        tampilkan: dataHeadline.tampilkan,
      };

      return { 
        data: data, 
        total: 1
      };
    } catch (error) {
      console.error("Error in fetchHeadline:", error);
      return { data: [], total: 0 };
    }
  }
}

module.exports = Model_r;
