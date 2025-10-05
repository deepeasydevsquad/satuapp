const {Op, Riwayat_deposit_airline, Mst_airline, Mst_bank } = require("../../../models");
const{ getCompanyIdByCode } = require("../../../helper/companyHelper");
const{ dbList } = require("../../../helper/dbHelper");
const{ convertToRP } = require("../../../helper/currencyHelper");
const Akuntansi = require("../../../library/akuntansi");
const moment = require("moment");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async list() {
    await this.initialize();
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;
    const cabang = body.cabang;

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
      "invoice",
      "deposit",      
      "updatedAt",
    ];
    sql["include"] = [
      {
        model: Mst_airline,
        attributes: ["name"],
        where: where
      }
    ];
    sql["where"] = { division_id: cabang };

    try {
      const query = await dbList(sql);
      const q = await Riwayat_deposit_airline.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Riwayat_deposit_airline.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data.push({ 
                id : e.id, 
                invoice : e.invoice,
                nama_maskapai : e.Mst_airline.name,
                nominal_deposit : e.deposit,  
                tanggal_deposit : moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss")
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
      console.log("~~~~~~~~~~~~~~~~~~~");
      console.log(error);
      console.log("~~~~~~~~~~~~~~~~~~~");
      return {};
    }
  }

  async info_add_deposit() {
    await this.initialize();

    const akuntansi = new Akuntansi(); 
    const division = this.req.body.cabang;
    try {
      var saldo = await convertToRP( await akuntansi.saldo_masing_masing_akun('11010', this.company_id, division, '0') );
      var sumber_dana = [{ id: 0, name: 'Kas (Saldo : ' + saldo + ')'}];
      await Mst_bank.findAll({ where: { company_id: this.company_id }, }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            var saldo = await convertToRP( await akuntansi.saldo_masing_masing_akun(e.nomor_akun, this.company_id, division, '0') );
            sumber_dana.push({ 
              id : e.id, 
              name : e.kode + ' (Saldo : ' + saldo + ')', 
            });
          })
        );
      });

      var list_maskapai = [];
      await Mst_airline.findAll({ where: { company_id: this.company_id }, }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
      
            list_maskapai.push({ 
              id : e.id, 
              name : e.name, 
            });
          })
        );
      });

      console.log("list_maskapai ========", list_maskapai);

      return { sumber_dana, list_maskapai };
    } catch (error) {

      console.log("~~~~~~~~~~~~~~~~~~~");
      console.log(error);   
      console.log("~~~~~~~~~~~~~~~~~~~");
      return {}      
    }
  } 
}

module.exports = Model_r;
