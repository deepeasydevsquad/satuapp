const { Op, Supplier, Mst_bank } = require("../../../models");
const{ getCompanyIdByCode } = require("../../../helper/companyHelper");
const{ getBankNameById, getBankIdByName } = require("../../../helper/bankHelper");
const{ dbList } = require("../../../helper/dbHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async daftar_supplier() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    var where = { company_id : this.company_id };
        
    if (body.search != undefined && body.search != "") {
      where = {...where,...{ 
        [Op.or]: [{ name : { [Op.like]: "%" + body.search + "%" } }, { address : { [Op.like]: "%" + body.search + "%" } }, { bank_id : { [Op.like]: "%" + await getBankIdByName(body.search) + "%" } }, { nomor_rekening : { [Op.like]: "%" + body.search + "%" } }]
      }};
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "name",
      "address",
      "bank_id",
      "nomor_rekening",
      "updatedAt",
    ];
    sql["where"] = where;
    sql['include'] = {
      required : true, 
      model : Mst_bank
    }

    try {

      const query = await dbList(sql);
      const q = await Supplier.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Supplier.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data.push({ 
                id : e.id, 
                name : e.name,
                address : e.address,
                bank : e.Mst_bank.name,
                bank_id : e.bank_id,
                nomor_rekening : e.nomor_rekening,
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
      return { data: [], total: 0 };
    }
  }

  async daftar_bank() {
    await this.initialize();
    try {
      const data = await Mst_bank.findAll({
        where: { company_id: this.company_id },
        attributes: ["id", "name"],
      });
      return {
        data: data,
        total: data.length,
      };
    } catch (error) {
      return { data: [], total: 0 };
    }
  }

  async infoSupplier(id, company_id) {
    try {
      var data = {};
      await Supplier.findOne({
          where: { id: id, company_id: company_id },
      }).then(async (e) => {
          if (e) {
              data["id"] = e.id;
              data["name"] = e.name;
              data["address"] = e.address;
              data["bank"] = await getBankNameById(e.bank_id);
              data["nomor_rekening"] = e.nomor_rekening;
          }
      });
      return data
    } catch (error) {
      return {}      
    }
  } 
}

module.exports = Model_r;
