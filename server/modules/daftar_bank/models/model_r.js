const { Op, Mst_bank, Akun_secondary, Division } = require("../../../models");
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

  async daftar_bank() {
    await this.initialize();
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    var where = { company_id : this.company_id };
        
    if (body.search != undefined && body.search != "") {
      where = {...where,...{ 
        [Op.or]: [{ name : { [Op.like]: "%" + body.search + "%" } }, { kode : { [Op.like]: "%" + body.search + "%" } }]
      }};
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "kode",
      "name",
      "nomor_akun",
      "updatedAt",
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql);
      const q = await Mst_bank.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Mst_bank.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data.push({ 
                id : e.id, 
                kode : e.kode,
                name : e.name, 
                nomor_akun: e.nomor_akun
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

      console.log("CCCCCCCCCCCCCCCCCCC");
      console.log(error);
      console.log("CCCCCCCCCCCCCCCCCCC");

      return {};
    }
  }

  async infoBank(id, company_id) {
    try {
      var data = {};
      await Mst_bank.findOne({
          where: { id: id, company_id : company_id },
      }).then(async (e) => {
          if (e) {
              data["id"] = e.id;
              data["kode"] = e.kode;
              data["name"] = e.name;
          }
      });
      return data
    } catch (error) {
      return {}      
    }
  } 

  async get_seluruh_cabang_id ( company_id ) {
    var list_division_id = [];
    await Division.findAll( { where : { company_id : company_id } }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          list_division_id.push(e.id);
        })
      );
    });
    return list_division_id;
  }

  async getInfoAkunSecondary(company_id, kodeBank){
    var data = {};
    await Akun_secondary.findOne({
      attributes : ['id'],
      where: { company_id: company_id, path : 'bank:kodeBank:' + kodeBank, tipe_akun: 'bawaan' },
    }).then(async (e) => {
        if (e) {
            data["id"] = e.id;
        }
    });
    return data
  }

  async generate_nomor_akun_secondary_bank( company_id ) {
    var nomorAkunBank = 11020;
    while (true) {
      nomorAkunBank = nomorAkunBank + 1;
        const sama = await Akun_secondary.findOne({ where: { nomor_akun: nomorAkunBank, company_id: company_id } });
      if (!sama) return nomorAkunBank;
    }
  }
}

module.exports = Model_r;
