const { Op, Agen, Level_keagenan, Member, Division, Fee_agen  } = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");

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
      const limit = body.perpage || 10;
      const page = body.pageNumber && body.pageNumber !== "0" ? body.pageNumber : 1;
  
      let where = {};
      let where_member = {};
  
      if (body.cabang) {
        where_member.division_id = body.cabang;
      }
  
      if (body.search) {
        where_member = {
          ...where_member,
          [Op.or]: [
            { fullname: { [Op.like]: `%${body.search}%` } },
            { identity_number: { [Op.like]: `%${body.search}%` } },
          ],
        };
      }
  
      const sql = {
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [["id", "ASC"]],
        attributes: [
          "id",
          "createdAt",
          "updatedAt",
        ],
        where: where,
        include: [
          {
            required : true, 
            model : Member, 
            attributes: ['fullname', "identity_number"],
            where : where_member, 
            include: {
              required: true, 
              model : Division,
              attributes: ['name'],
            }
          },
          {
            required : true, 
            model : Level_keagenan, 
            attributes: ['name'],
          },
        ]
      };
  
      try {
        const q = await Agen.findAndCountAll(sql);
        const total = q.count;
        let data = [];
  
        if (total > 0) {

          var agen_id = [];
          await Promise.all(
            await q.rows.map(async (e) => {
              data.push({
                id: e.id,
                fullname : e.Member.fullname,
                nomor_identitas: e.Member.identity_number,
                level: e.Level_keagenan.name,
                cabang: e.Member.Division.name,
                fee_agen: 0,
                createdAt: e.createdAt,
                updatedAt: e.updatedAt,
              });

              agen_id.push(e.id);
            })
          );


          var list_fee_agen = {};
          await Fee_agen.findAll({ 
            where : { 
              agen_id : { 
                [Op.in] : agen_id 
              }, 
              status_bayar: 'belum_lunas', 
              company_id: this.company_id 
            }}).then(async (value) => {
            await Promise.all(
              await value.map(async (e) => {
                if(list_fee_agen[e.agen_id] !== undefined ) {
                  list_fee_agen[e.agen_id] = list_fee_agen[e.agen_id] + e.nominal;
                }else{
                  list_fee_agen = {...list_fee_agen,...{[e.agen_id] : e.nominal } };
                }
              })
            );
          });

          for( let x in data) {
            if(list_fee_agen[data[x].id] != undefined ) {
              data[x].fee_agen = list_fee_agen[data[x].id];
            }
          }
        }
 
        return { data: data, total: total };
      } catch (error) {
        return { data: [], total: 0 };
      }
  }

  async infoAgen(id) {
    try {
      const pengguna = await Agen.findOne({
        where: { id },
        attributes: ["id", "createdAt", "updatedAt"],
        include: [
          { model: Member, attributes: ["fullname"] },
          { model: Level_keagenan, attributes: ["name"] },
        ],
      });
      return pengguna || {};
    } catch (error) {
      console.error("Error fetching user info:", error);
      return {};
    }
  }
}

module.exports = Model_r;
