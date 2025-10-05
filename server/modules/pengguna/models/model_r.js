const { User, Member, Grup, Division } = require("../../../models");
const { tipe, getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const { Op } = require("sequelize");

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

  async daftar_pengguna() {
    const body = this.req.body;
    var limit = body.perpage || 10;
    var page = body.pageNumber || 1;

    var where = {};
    if (body.search) {
      where = {
        ...where,
        [Op.or]: [{ id: { [Op.like]: `%${body.search}%` } }],
      };
    }

    var sql = {
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["id", "ASC"]],
      attributes: ["id", "createdAt", "updatedAt"],
      where,
      include: [
        { model: Member, attributes: ["fullname"], as: "Member" },
        { model: Division, attributes: ["name"], as: "Division" },
        { model: Grup, attributes: ["name"], as: "Grup" },
      ],
    };

    try {
      const { count, rows } = await User.findAndCountAll(sql);
      return { data: rows, total: count };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { data: [], total: 0 };
    }
  }

  async infoPengguna(id) {
    try {
      const pengguna = await User.findOne({
        where: { id },
        attributes: ["id", "createdAt", "updatedAt"],
        include: [
          { model: Member, attributes: ["fullname"], as: "Member" },
          { model: Division, attributes: ["name"], as: "Division" },
          { model: Grup, attributes: ["name"], as: "Grup" },
        ],
      });
      return pengguna || {};
    } catch (error) {
      console.error("Error fetching user info:", error);
      return {};
    }
  }

  async get_member() {

    await this.initialize();

    var memberIdIsUser = [];
    await User.findAll({ 
      include: {
        required : true, 
        model: Division, 
        where : { 
          company_id : this.company_id,
        }
      }, 
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
            memberIdIsUser.push(e.member_id);
        })
      );
    });

    console.log("*****************");
    console.log(memberIdIsUser);
    console.log("*****************");

    var data = [];
    await Member.findAll({ 
      include: {
        required : true, 
        model: Division, 
        where : { 
          company_id : this.company_id,
        }
      },
      where : { 
        id: { [Op.notIn] : memberIdIsUser }
      }
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          data.push({id: e.id, name: e.fullname });
        })
      );
    });


    console.log("^^^^^^^^^^^^^^^^^^^^^^^");
    console.log(data);
    console.log("^^^^^^^^^^^^^^^^^^^^^^^");

    return data;
  }

  async get_grup() {
    await this.initialize();

    var data = [];
    await Grup.findAll({ 
      include: {
        required : true, 
        model: Division, 
        where : { 
          company_id : this.company_id,
        }
      },
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          data.push({id: e.id, name: e.name });
        })
      );
    });

    return data;
  }


  async get_info_edit_pengguna() {

    await this.initialize();

    var data = {};
    await User.findOne({
      where: { id: this.req.body.id },
    }).then(async (e) => {
      if (e) {
        data["id"] = e.id;
        data["grup_id"] = e.grup_id;
      }
    });

    return data;
  }
}

module.exports = Model_r;
