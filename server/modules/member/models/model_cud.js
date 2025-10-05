const { sequelize, Member, Division, Jamaah, Agen, User, Deposit } = require("../../../models");
const Model_r = require("./model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, tipe, getCabang } = require("../../../helper/companyHelper");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { data } = require("jquery");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async getDivisionId() {
    const userType = await tipe(this.req);
    if (userType === "administrator") {
      return this.req.body.division_id;
    } else if (userType === "staff") {
      const decoded = jwt.decode(
        this.req.headers["authorization"]?.split(" ")[1]
      );
      return decoded?.division_id;
    } else {
      throw new Error("Role pengguna tidak valid.");
    }
  }

  async add() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      const division_id = await this.getDivisionId();
      if (!division_id) throw new Error("division_id tidak ditemukan");

      // Ambil file foto dari request
      const photo = this.req.file ? this.req.file.path : null;

      // Enkripsi password menggunakan bcryptjs
      const salt = await bcrypt.genSalt(10); // Generate salt
      const hashedPassword = await bcrypt.hash(body.password, salt); // Hash password

      const insert = await Member.create(
        {
          division_id: division_id,
          fullname: body.fullname,
          identity_number: body.identity_number,
          identity_type: body.identity_type,
          gender: body.gender,
          birth_place: body.birth_place,
          birth_date: body.birth_date,
          whatsapp_number: body.whatsapp_number,
          password: hashedPassword, // Simpan password yang sudah dienkripsi
          photo: photo, // Simpan path foto ke database
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      this.message = `Menambahkan member baru: ${body.fullname} (ID: ${insert.id})`;
      await writeLog(this.req, this.t, { msg: this.message });

      await this.t.commit();
      return { success: true, message: this.message, data: insert };
    } catch (error) {
      await this.t.rollback();
      return { success: false, message: error.message };
    }
  }

  async update() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      // call model_r object
      const model = new Model_r(this.req);
      // Cari member berdasarkan ID
      const member = await model.infoMember(body.id); // Teruskan transaksi

      // Ambil file foto dari request, jika ada
      const photo = this.req.file ? this.req.file.path : member.photo;

      // Jika password diupdate, enkripsi password baru
      let hashedPassword = member.password; // Default: gunakan password lama
      

      // Siapkan data untuk diupdate
      const updateData = {
        fullname: body.fullname,
        identity_number: body.identity_number,
        identity_type: body.identity_type,
        gender: body.gender,
        birth_place: body.birth_place,
        birth_date: body.birth_date,
        whatsapp_number: body.whatsapp_number,
        updatedAt: myDate,
      };

      // check password
      if (body.password) {
        const salt = await bcrypt.genSalt(10); // Generate salt
        hashedPassword = await bcrypt.hash(body.password, salt); // Hash password baru
        updateData['password'] = hashedPassword;
      }

      // Hanya update foto jika ada file yang diupload
      if (this.req.file) {
        updateData.photo = photo;
      }

      // Update data berdasarkan id dan division_id
      await Member.update(
        updateData, 
        {
          where: { 
            id: body.id 
          },
        },
        {
          transaction: this.t,
        }
      );
      // Log pesan update
      this.message = `Memperbarui Member ID ${body.id} (${member.fullname}) menjadi ${body.fullname}`;
    } catch (error) {
      this.state = false;
    }
  }

  // delete member
  async delete() {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    try {
      // call model
      const model_r = new Model_r(this.req);
      const member = await model_r.infoMember(body.id);
      // destroy Member
      await Member.destroy(
        {
          where: { id: body.id },
          include: {
            required : true, 
            model : Division, 
            where: { 
              company_id: this.company_id
            }
          }
        }, 
        {
          transaction: this.t,
        }
      );
      this.message = `Menghapus Member ${member.fullname} (ID: ${member.id})`;
    } catch (error) {
      this.state = false;
    }
  }

  async makeAnAgen() {
     // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      // call model
      const model_r = new Model_r(this.req);
      const member = await model_r.infoMember(body.id);

      console.log("************************");
      console.log("************************");
      console.log(this.req.body.upline);
      console.log("************************");
      console.log("************************");

      await Agen.create(
        {
          member_id: this.req.body.id,
          level_keagenan_id: this.req.body.level, 
          upline_id: this.req.body.upline != '0' ? this.req.body.upline : null,
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      this.message = `Menjadikan Member ${member.fullname} (ID: ${member.id}) Menjadi Agen`;
    } catch (error) {
      console.log("-----xx-----");
      console.log(error);
      console.log("-----xx-----");
      this.state = false;
    }
  }

  // response
 async response() {
    if (this.state) {
      await writeLog(this.req, this.t, { msg: this.message, });
      // commit
      await this.t.commit();
      return true;
    } else {
      // rollback
      await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
