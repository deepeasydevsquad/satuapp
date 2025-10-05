const { Op, Investor, Member, Division } = require("../../../models");
const{ getCompanyIdByCode, tipe, username, getCabang } = require("../../../helper/companyHelper");
const{ convertToRP } = require("../../../helper/currencyHelper");

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

  async list() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    var where = {};
    var where_division = { company_id : this.company_id };
    if( body.cabang != undefined && body.cabang != '') {
      where_division = {...where_division,...{ id: body.cabang } };
    }
        
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
      "identity_number",
      "mobile_phone",
      "address",
      "invesment",
      "stock",
      "updatedAt",
    ];
    sql["where"] = where;
    sql["include"] = {
      required : true,
      model : Division,
      attributes : ['name'],
      where : where_division
    };

    try {

      const { count, rows } = await Investor.findAndCountAll(sql);
      const total = count;
      var data = [];
      await Promise.all(
        await rows.map(async (e) => {
          data.push({
            id: e.id,
            name: e.name,
            identity_number:e.identity_number,
            mobile_phone:e.mobile_phone,
            address: e.address,
            invesment: await convertToRP(e.invesment) ,
            stock: e.stock,
            cabang: e.Division.name,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
          });
        })
      );

      return {
        data: data,
        total: total,
      };
    } catch (error) {
      return {};
    }
  }

  async infoInvestor(id, company_id) {
    try {
      var data = {};
      await Investor.findOne({
          where: { id: id,  },
          include: {
            required : true, 
            model : Division,
            where : { company_id: company_id }
          }
      }).then(async (e) => {
          if (e) {
              data["id"] = e.id;
              data["name"] = e.name;
          }
      });
     
      return data
    } catch (error) {
      return {}      
    }
  } 

  async getCabang() {
    // initialize dependensi properties
    await this.initialize();

    try {
      var data = [];
      var type = await tipe(this.req);
      if(type == 'administrator') {
        // get list cabang
        const { rows } = await Division.findAndCountAll({ where : { company_id : this.company_id} });
        await Promise.all(
          await rows.map(async (e) => {
            data.push({id: e.id,name: e.name });
          })
        );
      }else{
        await Member.findOne({
            where: { username: await username(this.req), company_id: this.company_id },
            include: {
              required : true,
              model : Division
            }
        }).then(async (e) => {
            if (e) {
              data.push({id: e.Division.id, name: e.Division.name});
            }
        });
      }
      return data;
    } catch (error) {
      return {}
    }
  }

  async getInvestor() {
    // initialize dependensi properties
    await this.initialize();

    try {
      var data = {};
      await Investor.findOne({
          where: { id: this.req.body.id},
          include : {
            required : true, 
            model : Division, 
            where : { company_id: this.company_id  }
          }
      }).then(async (e) => {
          if (e) {
            data['id'] = e.id;
            data['name'] = e.name;
            data['cabang_id'] = e.division_id;
            data['identity_number'] = e.identity_number;
            data['mobile_phone'] = e.mobile_phone;
            data['address'] = e.address;
            data['invesment'] = e.invesment;
            data['stock'] = e.stock;
          }
      });
      return data;
    } catch (error) {
      return {}
    }
  }
}

module.exports = Model_r;
