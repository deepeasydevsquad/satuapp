const { Member, User, Pembayaran_gaji, Division, Mst_bank } = require("../../../models");
const { Op } = require("sequelize");
const { getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const{ convertToRP } = require("../../../helper/currencyHelper");
const Akuntansi = require("../../../library/akuntansi");

class Model_r {
  constructor(req) {
    this.req = req;
    this.res = null;
    this.company_id = null;
    this.division_id = null;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
  }

  async daftar_pembayaran_gaji() {
    await this.initialize();
    const { body } = this.req;

    const limit = parseInt(body.perpage, 10) || 10;
    const page =
      parseInt(body.pageNumber, 10) > 0 ? parseInt(body.pageNumber, 10) : 1;
    const offset = (page - 1) * limit;

    const where = {};
    const userWhere = {};

    // Filter cabang (division)
    if (body.cabang) {
      userWhere.division_id = body.cabang;
    }

    // Filter search nama member
    if (body.search) {
      userWhere["$User.Member.fullname$"] = { [Op.like]: `%${body.search}%` };
    }

    try {
      const { count: total, rows } = await Pembayaran_gaji.findAndCountAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        where,
        include: [
          {
            model: User,
            required: true,
            where: userWhere,
            include: [
              {
                model: Member,
                attributes: ["fullname", "identity_number", "whatsapp_number"],
                required: true,
              },
              {
                model: Division,
                attributes: ["name"],
                required: true,
              },
            ],
          },
        ],
      });

      const data = rows.map((item) => ({
        id: item.id,
        name: item.User?.Member?.fullname || "-",
        identity_number: item.User?.Member?.identity_number || "-",
        whatsapp_number: item.User?.Member?.whatsapp_number || "-",
        invoice: item.invoice || "-",
        nominal: item.nominal || 0,
        division: item.User?.Division?.name || "-",
      }));

      return { data, total };
    } catch (error) {
      console.error("🔥 Error daftar_pembayaran_gaji:", error);
      return { data: [], total: 0 };
    }
  }

  async daftar_staff_sumber_dana() {
   
    await this.initialize();

    const body = this.req.body;
    const akuntansi = new Akuntansi(); 

    try {
      var sumber_dana = [];
      if( body.division_id != 0) {
        var saldo = await convertToRP( await akuntansi.saldo_masing_masing_akun('11010', this.company_id, body.division_id, '0') );
        sumber_dana = [{ id: 'kas', name: 'Kas (Saldo : ' + saldo + ')'}];
        await Mst_bank.findAll({ where: { company_id: this.company_id }, }).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              var saldo = await convertToRP( await akuntansi.saldo_masing_masing_akun(e.nomor_akun, this.company_id, body.division_id, '0') );
              sumber_dana.push({ 
                id : e.id, 
                name : e.kode + ' (Saldo : ' + saldo + ')', 
              });
            })
          );
        });
      }
      
      const sql = await User.findAll({
        where: {
          division_id: body.division_id,
        },
        include: [
          {
            required: true,
            model: Member,
            attributes: ["fullname"],
          },
        ],
      });

      const data = sql.map((user) => ({
        id: user.id,
        name: user.Member?.fullname || "-",
      }));

      return {
        status: "success",
        data : { staff: data, sumber_dana },
      };
    } catch (error) {
      return {
        status: "error",
        data: [],
        message: error.message,
      };
    }
  }
}

module.exports = Model_r;
