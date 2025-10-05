const { Op, Request_member, Agen, Member, Division } = require("../../../models");
const{ getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
const{ dbList } = require("../../../helper/dbHelper");
const moment = require("moment");

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

  async list() {
    await this.initialize();
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    let where = { division_id: this.req.body.cabang, status: body.status };
        
    if (body.search != undefined && body.search != "") {
      where = {...where,...{ 
        [Op.or]: [{ fullname : { [Op.like]: "%" + body.search + "%" } }]
      }};
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "fullname",
      "identity_number",
      "identity_type",
      "gender",
      "birth_date",
      "birth_place",
      "whatsapp_number",
      "address",
      "status",
      "updatedAt",
    ];
    sql["where"] = where;
    sql['include']  = [
      {
        model: Agen,
        include: {
          model: Member,
          attributes: ['fullname']
        }
      }, 
      {
        model: Division,
        attributes: ['name']
      }
    ]

    try {
      const query = await dbList(sql);
      const q = await Request_member.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Request_member.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data.push({ 
                id : e.id, 
                fullname: e.fullname,
                identity_number: e.identity_number,
                identity_type: e.identity_type, 
                gender: e.gender, 
                birth_date: e.birth_date,
                birth_place: e.birth_place,
                whatsapp_number: e.whatsapp_number,
                address: e.address,
                agen: e.Agen ? (e.Agen.Member ? e.Agen.Member.fullname : '') : '',
                cabangName: e.Division ? e.Division.name : '',
                status: e.status,
                updatedAt: moment( e.updatedAt ).format("YYYY-MM-DD HH:mm:ss"),
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

}

module.exports = Model_r;
