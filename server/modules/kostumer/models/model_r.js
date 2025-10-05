const {Op, Kostumer } = require("../../../models");
const{ getCompanyIdByCode } = require("../../../helper/companyHelper");
const{ dbList } = require("../../../helper/dbHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async daftar_kostumer() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    var where = { company_id : this.company_id };
        
    if (body.search != undefined && body.search != "") {
      where = {...where,...{ 
        [Op.or]: [{ name : { [Op.like]: "%" + body.search + "%" } }, { mobile_number : { [Op.like]: "%" + body.search + "%" } }, { address : { [Op.like]: "%" + body.search + "%" } }]
      }};
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "name",
      "mobile_number",
      "address",
      "updatedAt",
    ];
    sql["where"] = where;

    try {

      const query = await dbList(sql);
      const q = await Kostumer.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Kostumer.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data.push({ 
                id : e.id, 
                name : e.name,
                mobile_number : e.mobile_number,
                address : e.address
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
      return {};
    }
  }

  async infokostumer(id) {
    try {
      var data = {};
      await Kostumer.findOne({
          where: { id: id },
      }).then(async (e) => {
          if (e) {
              data["id"] = e.id;
              data["name"] = e.name;
              data["mobile_number"] = e.mobile_number;
              data["address"] = e.address;
          }
      });
      
      return data
    } catch (error) {
      return {}      
    }
  } 
}

module.exports = Model_r;
