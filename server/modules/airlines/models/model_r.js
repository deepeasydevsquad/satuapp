const { Op, Mst_airline, Division } = require("../../../models");
const{ getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
const{ convertToRP } = require("../../../helper/currencyHelper");
const{ dbList } = require("../../../helper/dbHelper");
const Akuntansi = require("../../../library/akuntansi");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.tipe;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.tipe = await tipe(this.req);
  }

  async daftar_airlines() {
    await this.initialize();
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;
    const akuntansi = new Akuntansi(); 

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
      "nomor_akun_deposit",
      "nomor_akun_pendapatan",
      "nomor_akun_hpp",
      "updatedAt",
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql);
      const q = await Mst_airline.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {


        var listDepositDivison = [];
        var whereDiv = { company_id: this.company_id };
        if( this.tipe == 'staff') {
          whereDiv = {...whereDiv,...{id : this.division_id } };
        }
        const qDiv = await Division.findAll({
          where: whereDiv,
        });
        qDiv.forEach((e) => {
          listDepositDivison.push({ id: e.id, nama_cabang: e.name, deposit: 0 });
        })

        await Mst_airline.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              var list_deposit = [];
              for (var d of listDepositDivison) {
                var saldo = await akuntansi.saldo_masing_masing_akun(e.nomor_akun_deposit, this.company_id, d.id, '0');
                list_deposit.push({ cabang: d.nama_cabang, deposit: await convertToRP(saldo) });
              }
              data.push({ 
                id : e.id, 
                name : e.name, 
                nomor_akun_deposit: e.nomor_akun_deposit,
                nomor_akun_pendapatan: e.nomor_akun_pendapatan,
                nomor_akun_hpp: e.nomor_akun_hpp,
                deposit: list_deposit
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
      console.log("xxxxxxxxx--------------------");
      console.log(error); 
      console.log("xxxxxxxxx--------------------");
      return {};
    }
  }

  async infoAirline(id, company_id) {
    try {
      var data = {};
      await Mst_airline.findOne({
          where: { id: id, company_id:company_id },
      }).then(async (e) => {
          if (e) {
              data["id"] = e.id;
              data["name"] = e.name;
              data["nomor_akun_deposit"] = e.nomor_akun_deposit;
              data["nomor_akun_pendapatan"] = e.nomor_akun_pendapatan;
              data["nomor_akun_hpp"] = e.nomor_akun_hpp;
          }
      });
      return data
    } catch (error) {
      return {}      
    }
  } 
}

module.exports = Model_r;
