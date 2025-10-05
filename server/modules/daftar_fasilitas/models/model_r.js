const { Op, Mst_fasilitas } = require("../../../models");
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

  async daftar_fasilitas() {
    await this.initialize();
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    var where = { company_id : this.company_id };
        
    if (body.search != undefined && body.search != "") {
      where = {...where,...{ 
        [Op.or]: [{ name : { [Op.like]: "%" + body.search + "%" } }]
      }};
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "name",
      "nomor_akun_aset",
      "nomor_akun_hpp",
      "nomor_akun_pendapatan",
      "updatedAt",
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql);
      const q = await Mst_fasilitas.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Mst_fasilitas.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data.push({ 
                id : e.id,
                name : e.name,
                nomor_akun_aset: e.nomor_akun_aset,
                nomor_akun_hpp: e.nomor_akun_hpp,
                nomor_akun_pendapatan: e.nomor_akun_pendapatan
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

  async infoFasilitas(id, company_id) {
    try {
      var data = {};
      await Mst_fasilitas.findOne({
          where: { id: id, company_id: company_id },
      }).then(async (e) => {
          if (e) {
              data["id"] = e.id;
              data["name"] = e.name;
              data['nomor_akun_aset'] = e.nomor_akun_aset;
              data['nomor_akun_hpp'] = e.nomor_akun_hpp;
              data['nomor_akun_pendapatan'] = e.nomor_akun_pendapatan;
          }
      });
      return data
    } catch (error) {
      return {}      
    }
  } 
}

module.exports = Model_r;
