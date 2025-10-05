const { Op, Member, Agen, Jamaah, User, Division, Level_keagenan } = require("../../../models");
const { tipe, getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const moment = require("moment");

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

  // Fungsi untuk mengambil daftar member dengan filter dan pagination
  async list() {
    const body = this.req.body;
    const limit = body.perpage || 10;
    const page = body.pageNumber && body.pageNumber !== "0" ? body.pageNumber : 1;

    let where = {};

    // Filter berdasarkan division_id jika ada
    if (body.cabang) {
      where.division_id = body.cabang;
    }

    // Filter berdasarkan pencarian (search)
    if (body.search) {
      where = {
        ...where,
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
        "division_id",
        "fullname",
        "identity_number",
        "identity_type",
        "gender",
        "photo",
        "birth_place",
        "birth_date",
        "whatsapp_number",
        "createdAt",
        "updatedAt",
      ],
      where: where,
      include: {
        required : true, 
        model : Division, 
        attributes: ['name']
      }
    };

    try {
      const q = await Member.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        // Ambil tipe dari token JWT
        const type = await tipe(this.req);
        var agen_id = await this.get_member_id_as_agen();
        var jamaah_id = await this.get_member_id_as_jamaah();
        var staff_id = await this.get_member_id_as_staff();

        data = q.rows.map((e) => ({
          id: e.id,
          cabang_id : e.division_id,
          cabang: e.Division.name,
          fullname: e.fullname,
          identity_number: e.identity_number,
          identity_type: e.identity_type,
          gender: e.gender,
          photo: e.photo,
          birth_place: e.birth_place,
          birth_date: e.birth_date,
          whatsapp_number: e.whatsapp_number,
          status_agen: agen_id.includes(e.id) ? true : false,
          status_staff : staff_id.includes(e.id) ? true : false,
          status_jamaah: jamaah_id.includes(e.id) ? true : false,
          tipe: type, // Sertakan tipe dalam respons
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        }));
      }

      return { data: data, total: total };
    } catch (error) {
      console.error("ERROR: daftar_member()", error);
      return { data: [], total: 0 };
    }
  }

  async infoEditMember() {
    // initialize dependensi properties
    await this.initialize();

    try {
      const member = await Member.findOne({
        where: {
          id: this.req.body.id
        },
        include: {
          required: true, 
          model: Division, 
          where: { company_id: this.company_id}
        }
      });

      return {
        id: member.id,
        cabang_id: member.division_id,
        fullname: member.fullname,
        identity_number: member.identity_number,
        identity_type: member.identity_type,
        gender: member.gender,
        photo: member.photo,
        birth_place: member.birth_place,
        birth_date: moment(member.birth_date).format("YYYY-MM-DD"),
        whatsapp_number: member.whatsapp_number,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      };


    } catch (error) {
      return {};
    }
  }

  async getDaftarCabang() {
    // initialize dependensi properties
    await this.initialize();
    var data = [{id : 0, name: 'Pilih Cabang'}];
    if( this.type === 'administrator' ) {
      const { rows } = await Division.findAndCountAll({ where : { company_id : this.company_id} });
      await Promise.all(
        await rows.map(async (e) => {
          data.push({id: e.id,name: e.name });
        })
      );
    }else{
      const { rows } = await Division.findAndCountAll({ where : { id: this.division, company_id : this.company_id} });
      await Promise.all(
        await rows.map(async (e) => {
          data.push({id: e.id,name: e.name });
        })
      );
    }
    return data;
  }

  async getTipe() {
    const type = await tipe(this.req);
    return type;
  }

  async get_member_id_as_agen(){
    var data = [];
    const { rows } = await Agen.findAndCountAll({ 
    include : { 
      required : true, 
      model : Member, 
      attributes : ['id']
    }});
    await Promise.all(
      await rows.map(async (e) => {
        data.push(e.Member.id);
      })
    );
    return data
  }

  async get_member_id_as_jamaah(){
    var data = [];
    const { rows } = await Jamaah.findAndCountAll({ 
    include : { 
      required : true, 
      model : Member, 
      attributes : ['id']
    }});
    await Promise.all(
      await rows.map(async (e) => {
        data.push(e.Member.id);
      })
    );
    return data
  }

  async get_member_id_as_staff() {
    var data = [];
    const { rows } = await User.findAndCountAll({ 
    include : { 
      required : true, 
      model : Member, 
      attributes : ['id']
    }});
    await Promise.all(
      await rows.map(async (e) => {
        data.push(e.Member.id);
      })
    );
    return data
  }

    // Fungsi untuk mengambil informasi detail member berdasarkan ID
  async infoMember(id) {
    // initialize dependensi properties
    await this.initialize()
    try {
      // Cari member di database
      const member = await Member.findOne({
        where: { id: id } // Teruskan transaksi jika ada
      });

      // Jika member tidak ditemukan, kembalikan null
      // if (!member) return null;

      // Ambil tipe dari token JWT
      const type = await tipe(this.req);

      // Kembalikan data member yang diperlukan
      return {
        id: member.id,
        fullname: member.fullname,
        identity_number: member.identity_number,
        identity_type: member.identity_type,
        gender: member.gender,
        photo: member.photo,
        birth_place: member.birth_place,
        birth_date: member.birth_date,
        whatsapp_number: member.whatsapp_number,
        tipe: type, // Sertakan tipe dalam respons
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      };
    } catch (error) {
      // Log error dengan detail
      console.error("ERROR: infoMember()", {
        message: error.message,
        stack: error.stack,
        id: id,
      });

      // Lempar error kembali agar bisa ditangani oleh pemanggil
      throw new Error(`Gagal mengambil data member: ${error.message}`);
    }
  }

  // Fungsi untuk memeriksa apakah nomor identitas sudah terdaftar
  async isIdentityNumberExists(identity_number, identity_type) {
    try {
      const member = await Member.findOne({
        where: {
          identity_number: identity_number,
          identity_type: identity_type,
        },
      });
      return !!member; // Mengembalikan true jika ditemukan, false jika tidak
    } catch (error) {
      console.error("ERROR: isIdentityNumberExists()", error);
      return false;
    }
  }


  async get_level_agen() {
    // initialize dependensi properties
    await this.initialize()

    try {
      var data = [{id: 0, name: 'Pilih Level', level: '-'}];
      const { rows } = await Level_keagenan.findAndCountAll({ 
        where : { 
          company_id : this.company_id 
        },
        order: [["level", "ASC"]],
      });
      await Promise.all(
        await rows.map(async (e) => {
          data.push({ id: e.id, name: e.name, level: e.level });
        })
      );
      return data
    } catch (error) {
      return []     
    }
  }

  async listUpline() {
    // initialize dependensi properties
    await this.initialize()

    try {
      var data = [{id: 0, name: 'Pilih Upline'}];
      const { rows } = await Agen.findAndCountAll({
        where: {
            member_id: {
              [Op.ne] : this.req.body.id
            }
        },
        include: {
          required : true,
          model: Member, 
          include: {
            required: true, 
            model: Division,
            where : {
              company_id : this.company_id,
            }
          }
        },
        order: [["id", "ASC"]],
      });
      await Promise.all(
        await rows.map(async (e) => {
          data.push({ id: e.id, name: e.Member.fullname  });
        })
      );
      return data
    } catch (error) {
      return []     
    }
  }

}

module.exports = Model_r;
