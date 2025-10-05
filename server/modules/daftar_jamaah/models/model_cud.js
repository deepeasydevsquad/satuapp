const {
  sequelize,
  Jamaah,
  Member,
  Mahram,
  Division,
} = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, tipe } = require("../../../helper/companyHelper");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

class Model_cud {

  constructor(req) {
    this.req = req;
    this.company_id;
  }



  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async getDivisionId() {
    const userType = await tipe(this.req);
    if (userType === "administrator") {
      return this.req.body.division_id;
    } else if (userType === "staff") {
      const token = this.req.headers["authorization"]?.split(" ")[1];
      const decoded = token ? jwt.decode(token) : null;
      return decoded?.division_id;
    } else {
      throw new Error("Role pengguna tidak valid.");
    }
  }

  async tambahJamaah() {
    await this.initialize();
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    console.log("📥 Body:", body);

    const { member_id, mahram, ...jamaahData } = body;
    const division_id = await this.getDivisionId();

    let memberId;

    try {
      if (!member_id) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);

        const newMember = await Member.create(
          {
            division_id: division_id,
            fullname: body.fullname,
            identity_number: body.identity_number,
            identity_type: body.identity_type,
            gender: body.gender,
            birth_place: body.birth_place,
            birth_date: body.birth_date,
            whatsapp_number: body.whatsapp_number,
            password: hashedPassword,
            photo: body.photoPath,
            createdAt: myDate,
            updatedAt: myDate,
          },
          { transaction: this.t }
        );

        memberId = newMember.id;
      } else {
        memberId = member_id;
      }

      const newJamaah = await Jamaah.create(
        {
          division_id: division_id,
          agen_id: jamaahData.agen_id == "0" ? null : jamaahData.agen_id,
          member_id: memberId,
          kelurahan_id: jamaahData.kelurahan_id,
          address: jamaahData.address,
          title: jamaahData.title,
          nama_ayah: jamaahData.nama_ayah,
          nama_passport: jamaahData.nama_passport,
          nomor_passport: jamaahData.nomor_passport,
          tanggal_di_keluarkan_passport: jamaahData.tanggal_di_keluarkan_passport,
          tempat_di_keluarkan_passport: jamaahData.tempat_di_keluarkan_passport,
          masa_berlaku_passport: jamaahData.masa_berlaku_passport,
          kode_pos: jamaahData.kode_pos,
          nomor_telephone: jamaahData.nomor_telephone,
          email: jamaahData.email,
          pengalaman_haji: jamaahData.pengalaman_haji,
          tahun_haji: jamaahData.tahun_haji,
          pengalaman_umrah: jamaahData.pengalaman_umrah,
          tahun_umrah: jamaahData.tahun_umrah,
          desease: jamaahData.desease,
          last_education: jamaahData.last_education,
          blood_type: jamaahData.blood_type,
          photo_4_6: jamaahData.photo_4_6 === false ? 'tidak_ada' : jamaahData.photo_4_6,
          photo_3_4: jamaahData.photo_3_4 === false ? 'tidak_ada' : jamaahData.photo_3_4,
          fc_passport: jamaahData.fc_passport,
          mst_pekerjaan_id: jamaahData.mst_pekerjaan_id,
          profession_instantion_name: jamaahData.profession_instantion_name,
          profession_instantion_address: jamaahData.profession_instantion_address,
          profession_instantion_telephone: jamaahData.profession_instantion_telephone,
          fc_kk: jamaahData.fc_kk === false ? 'tidak_ada' : jamaahData.fc_kk,
          fc_ktp: jamaahData.fc_ktp === false ? 'tidak_ada' : jamaahData.fc_ktp,
          buku_nikah: jamaahData.buku_nikah === false ? 'tidak_ada' : jamaahData.buku_nikah,
          akte_lahir: jamaahData.akte_lahir === false ? 'tidak_ada' : jamaahData.akte_lahir,
          buku_kuning: jamaahData.buku_kuning === false ? 'tidak_ada' : jamaahData.buku_kuning,
          keterangan: jamaahData.keterangan,
          nama_keluarga: jamaahData.nama_keluarga,
          alamat_keluarga: jamaahData.alamat_keluarga,
          telephone_keluarga: jamaahData.telephone_keluarga,
          status_nikah: jamaahData.status_nikah,
          tanggal_nikah: jamaahData.tanggal_nikah,
          kewarganegaraan: jamaahData.kewarganegaraan,
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      if (Array.isArray(mahram)) {
        for (const m of mahram) {
          await Mahram.create(
            {
              company_id: this.company_id,
              jamaah_id: newJamaah.id || 0,
              mahram_id: m.mahram_id || 0,
              mst_mahram_type_id: m.mst_mahram_type_id || 0,
              createdAt: myDate,
              updatedAt: myDate,
            },
            { transaction: this.t }
          );
        }
      }

      this.message = `Menambahkan Jamaah Baru dengan ID Jamaah: ${newJamaah.id}`;
    } catch (error) {
      console.error("Error in tambahJamaah(): ", error);
      this.state = false;
    }
  }

  async editJamaah() {
    await this.initialize();
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    console.log("Data dari frontend:", this.req.body);

    const { member_id, mahram, ...jamaahData } = body;

    try {
      // 1. Validasi passwordnya sama atau tidak
      const existingMember = await Member.findByPk(member_id);

      if (body.photoPath && existingMember.photo) {
        const filePath = path.join(__dirname, `../../../uploads/member/${existingMember.photo}`);
        console.log("filePath: ", filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("File dihapus:", filePath);
        }
      }

      // 2. Update data Member
      const updateData = {
        fullname: body.fullname,
        identity_number: body.identity_number,
        identity_type: body.identity_type,
        gender: body.gender,
        birth_place: body.birth_place,
        birth_date: body.birth_date,
        whatsapp_number: body.whatsapp_number,
        photo: body.photoPath ?? existingMember.photo,
        updatedAt: myDate,
      };

      if (body.password) {
        const salt = await bcrypt.genSalt(10); // Generate salt
        const hashedPassword = await bcrypt.hash(body.password, salt); // Hash password baru
        updateData['password'] = hashedPassword;
      }

      await existingMember.update(updateData, { transaction: this.t });

      // 3. Update data Jamaah
      const existingJamaah = await Jamaah.findOne({
        where: { member_id: member_id },
        transaction: this.t,
      });

      await existingJamaah.update(
        {
          ...jamaahData,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      // 3. Update atau Insert Mahram
      if (Array.isArray(mahram)) {
        // Delete existing mahrams
        await Mahram.destroy({
          where: { jamaah_id: existingJamaah.id },
          transaction: this.t,
        });
        
        // Insert new mahrams
        for (const m of mahram) {
          await Mahram.create(
            {
              company_id: this.company_id,
              jamaah_id: existingJamaah.id,
              mahram_id: m.mahram_id,
              mst_mahram_type_id: m.mst_mahram_type_id,
              createdAt: myDate,
              updatedAt: myDate,
            },
            { transaction: this.t }
          );
        }
      }

      this.message = `Memperbarui data jamaah dengan ID Jamaah: ${existingJamaah.id} dan ID Member: ${member_id}`;
    } catch (error) {
      console.error("❌ ERROR EDIT FULL:", error);
      this.state = false;
    }
  }

  async deleteJamaah() {
    await this.initialize(); // Inisialisasi transaksi dan company_id
    const division_id = await this.getDivisionId();
    const { id } = this.req.body;

    try {
      console.log("🔍 Mencari Jamaah dengan id:", id);

      // Cari data jamaah berdasarkan id
      const jamaah = await Jamaah.findOne({
        where: { id, division_id },
        transaction: this.t,
      });

      const jamaahId = jamaah.id;

      // Hapus Mahram yang terkait
      await Mahram.destroy({
        where: { jamaah_id: jamaahId, company_id: this.company_id },
        transaction: this.t,
      });

      // Hapus Jamaah
      await Jamaah.destroy({
        where: { id, division_id },
        transaction: this.t,
      });

      this.message = `Menghapus data jamaah dengan ID Jamaah: ${jamaahId}`;
    } catch (error) {
      console.error("❌ ERROR:", error);
      this.state = false;
    }
  }

  // response
  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, {
        msg: this.message,
      });
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
