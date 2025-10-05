const { Op, Mst_hotel, Mst_kota } = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { getKotaNameById, getKotaIdByCharName } = require("../../../helper/kotaHelper");
const { dbList } = require("../../../helper/dbHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async daftar_kota() {
    await this.initialize();
    try {
      const data = await Mst_kota.findAll({
        where: { company_id: this.company_id },
        attributes: ["id", "name"],
        order: [["name", "ASC"]]
      });
      return {
        data: data,
        total: data.length,
      };
    } catch (error) {
      return { data: [], total: 0 };
    }
  }

  async daftar_hotel() {
    await this.initialize();
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    var where = { company_id : this.company_id };
        
    if (body.search != undefined && body.search != "") {
      where = {...where,...{ 
        [Op.or]: [{ kota_id : { [Op.like]: "%" + await getKotaIdByCharName(body.search, this.company_id) + "%" } }, { name : { [Op.like]: "%" + body.search + "%" } }, { desc : { [Op.like]: "%" + body.search + "%" } }, { star : { [Op.like]: "%" + body.search + "%" } }]
      }};
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "kota_id",
      "name",
      "desc",
      "star",
      "updatedAt",
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql);
      const q = await Mst_hotel.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Mst_hotel.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data.push({ 
                id: e.id,
                kota: await getKotaNameById(e.kota_id),
                name: e.name,
                desc: e.desc,
                star: e.star,
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
      return {};
    }
  }

  async infoHotel(id, company_id) {
    try {
      var data = {};
      await Mst_hotel.findOne({
          where: { id: id, company_id : company_id },
      }).then(async (e) => {
          if (e) {
              data["id"] = e.id;
              data["kota"] = await getKotaNameById(e.kota_id);
              data["name"] = e.name;
              data["desc"] = e.desc;
              data["star"] = e.star;
          }
      });
      return data
    } catch (error) {
      return {}      
    }
  } 
}

module.exports = Model_r;

