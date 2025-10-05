const fs = require("fs");
const path = require("path");
const ExcelJS = require('exceljs');
const moment = require("moment");
const jwt = require("jsonwebtoken");

const {
  Member,
  Agen,
  Jamaah,
  sequelize,
  Division,
  Mst_pekerjaan,
  Mst_pendidikan
} = require("../../../models");
const { Op } = require("sequelize");
const { getCompanyIdByCode, tipe, getCabang } = require("../../../helper/companyHelper");
const { getAlamatInfo } = require("../../../helper/alamatHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null;
    this.division_id = null;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
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

  async getInfoMember() {
    try {
      const division_id = await this.getDivisionId();
      const body = this.req.body;
      const jamaah = await Member.findOne({
        where: { id: body.member_id, division_id: division_id },
        attributes: [
          "id",
          "fullname",
          "identity_number",
          "whatsapp_number",
          "photo",
          "birth_place",
          "birth_date",
          "gender",
        ],
        include: [
          {
            model: Division,
            required: true,
            attributes: ["name"],
          },
        ],

      });
      const data = {
        id: jamaah.id,
        fullname: jamaah.fullname,
        cabang_name: jamaah.Division.name,
        identity_number: jamaah.identity_number,
        whatsapp_number: jamaah.whatsapp_number,
        photo: jamaah.photo,
        birth_place: jamaah.birth_place,
        birth_date: moment(jamaah.birth_date).format('DD MMMM YYYY'),
        gender: jamaah.gender,
      };

      return {
        data: data,
        total: 1,
      };
    } catch (error) {
      console.error("ERROR: getInfoMember()", {
        message: error.message,
        stack: error.stack,
      });
      throw new Error("Gagal mengambil data member: " + error.message);
    }
  }

  async getMemberNotJamaah() {
    const division_id = await this.getDivisionId();
    console.log(division_id)

    const jamaahIds = await Jamaah.findAndCountAll({
      attributes: ["member_id"],
      where: { division_id : division_id }
    });

    var where = { division_id : division_id };

    if(jamaahIds.length > 0 ) {
      where = {...where,...{id : {[Op.notIn] : jamaahIds } } };
    }

    const sql = {
      order: [["id", "ASC"]],
      attributes: ["id", "fullname", "identity_number"],
      where: where
    };

    try {
      const { count, rows } = await Member.findAndCountAll(sql);
      let data = [];
      if (count > 0) {
        await Promise.all(
          rows.map(async (e) => {
            data.push({
              id: e.id,
              fullname: e.fullname,
              identity_number : e.identity_number,
            });
          })
        );
      }

      return {
        data: data,
        total: count,
      };
    } catch (error) {
      console.error("ERROR: daftar_member()", error);
      return { data: [], total: 0 };
    }
  }

  async getAgen() {
    const division_id = await this.getDivisionId();

    var where = { '$Member.division_id$' : division_id };
    console.log(where)

    const sql = {
      order: [["id", "ASC"]],
      attributes: ["id"],
      where: where,
      include: [
        {
          model: Member,
          attributes: ["fullname", "identity_number", "gender"],
        }
      ]
    };
    
    try {
      const { count, rows } = await Agen.findAndCountAll(sql);
      let data = [];
      console.log(rows)
      if (count > 0) {
        await Promise.all(
          rows.map(async (e) => {
            data.push({
              id: e.id,
              fullname: `${e.Member.fullname} (${e.Member.identity_number})`,
            });
          })
        );
      }
      console.log(data)

      return {
        data: data,
        total: count,
      };
    } catch (error) {
      console.error("ERROR: daftar_member()", error);
      return { data: [], total: 0 };
    }
  }

  async getMemberNotJamaah() {
    const division_id = await this.getDivisionId();

    var where = { division_id : division_id };

    const jamaahIds = await Jamaah.findAll({
      attributes: ["member_id"],
      where: { division_id : division_id },
      raw: true,
    });

    console.log(jamaahIds)
    console.log(jamaahIds.map(e => e.member_id))

    if(jamaahIds.length > 0 ) {
      where = {...where,...{id : {[Op.notIn] : jamaahIds.map(e => e.member_id) } } };
    }

    const sql = {
      order: [["id", "ASC"]],
      attributes: ["id", "fullname", "identity_number"],
      where: where,
    };

    try {
      const { count, rows } = await Member.findAndCountAll(sql);
      let data = [];
      if (count > 0) {
        await Promise.all(
          rows.map(async (e) => {
            data.push({
              id: e.id,
              name: `${e.fullname} (${e.identity_number})`,
            });
          })
        );
      }

      return {
        data: data,
        total: count,
      };
    } catch (error) {
      console.error("ERROR: daftar_member()", error);
      return { data: [], total: 0 };
    }
  }

  async getJamaahNotMember() {
    const division_id = await this.getDivisionId();

    var where = { division_id : division_id };

    const sql = {
      order: [["id", "ASC"]],
      attributes: ["id"],
      where: where,
      include: [
        {
          model: Member,
          attributes: ["fullname", "identity_number", "gender"],
        }
      ]
    };

    try {
      const { count, rows } = await Jamaah.findAndCountAll(sql);
      let data = [];
      if (count > 0) {
        await Promise.all(
          rows.map(async (e) => {
            data.push({
              id: e.id,
              fullname: `${e.Member.fullname} (${e.Member.identity_number})`,
            });
          })
        );
      }

      return {
        data: data,
        total: count,
      };
    } catch (error) {
      console.error("ERROR: daftar_member()", error);
      return { data: [], total: 0 };
    }
  }

  async daftar_jamaah() {
    await this.initialize();
    const body = this.req.body;
    const limit = body.perpage || 10;
    const page = body.pageNumber && body.pageNumber !== "0" ? body.pageNumber : 1;
    const filterCabang = body.filterCabang || null;

    let where = {};

    if (filterCabang) {
      where = { ...where, division_id: filterCabang };
    } else {
      where = { ...where, division_id: this.division_id};
    }

    if (body.search) {
      where = {
        ...where,
        [Op.or]: [
          { '$Member.fullname$': { [Op.like]: `%${body.search}%` } },
          { '$Member.identity_number$': { [Op.like]: `%${body.search}%` } },
        ],
      };
    }

    const sql = {
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["id", "ASC"]],
      where: where,
      attributes: [
          "id", 
          "nomor_passport",
        ], 
      include: [
        {
          model: Member,
          attributes: [
            "id",
            "fullname",
            "identity_number",
            "birth_place",
            "birth_date",
          ],
        },
      ],
    };

    try {
      const q = await Jamaah.findAndCountAll(sql); // Cari data dari Jamaah
      const total = q.count;
      let data = [];

      if (total > 0) {
        data = q.rows.map((jamaah) => {
          const member = jamaah.Member;

          return {
            id: jamaah.id,
            identity_number: member.identity_number,
            nomor_passport: jamaah.nomor_passport,
            fullname: member.fullname ,
            birth_place:member.birth_place,
            birth_date: moment(member.birth_date).format('DD-MM-YYYY'),
          };
        });
      }

      return {
        data: data,
        total: total,
      };
    } catch (error) {
      console.error("ERROR: daftar_jamaah()", error);
      return { data: [], total: 0 };
    }
  }

  async getInfoUpdate() {
    const body = this.req.body; 
    const division_id = await this.getDivisionId();

    let where = {
      id: body.id,
      division_id: division_id
    };  

    const sql = {
      where: where,
      attributes: [
            "id",
            "kelurahan_id",
            "agen_id",
            "address",
            "nomor_passport",// Menambahkan whatsapp_number dari Jamaah
            "nama_ayah",
            "nama_passport",
            "tanggal_di_keluarkan_passport",
            "tempat_di_keluarkan_passport",
            "masa_berlaku_passport",
            "kode_pos",
            "nomor_telephone",
            "email",
            "pengalaman_haji",
            "tahun_haji",
            "pengalaman_umrah",
            "tahun_umrah",
            "desease",
            "last_education",
            "blood_type",
            "photo_4_6",
            "photo_3_4",
            "fc_passport",
            "mst_pekerjaan_id",
            "profession_instantion_name",
            "profession_instantion_address",
            "profession_instantion_telephone",
            "fc_kk",
            "fc_ktp",
            "buku_nikah",
            "akte_lahir",
            "buku_kuning",
            "keterangan",
            "nama_keluarga",
            "alamat_keluarga",
            "telephone_keluarga",
            "status_nikah",
            "tanggal_nikah",
            "kewarganegaraan",
            "title",], // Ambil nomor_passport dari Jamaah
      include: [
        {
          model: Member, // Menyertakan data Member yang terkait dengan Jamaah
          attributes: [
            "id",
            "fullname",
            "identity_type",
            "gender",
            "photo",
            "identity_number",
            "birth_place",
            "birth_date",
            "whatsapp_number", // Menambahkan whatsapp_number dari Member
          ],
        },
      ],
    }

    try {
      const q = await Jamaah.findOne(sql); // Cari data dari Jamaah

      const alamat = await getAlamatInfo(q.kelurahan_id);
      console.log("alamat:", alamat);
      let data = {};
      
      if (q) {
        data = {
          id: q.id,
          member_id: q.Member.id,
          agen_id: q.agen_id,
          title: q.title,
          address: q.address,
          fullname: q.Member.fullname,
          identity_type: q.Member.identity_type,
          gender: q.Member.gender,
          photo: q.Member.photo,
          identity_number: q.Member.identity_number,
          birth_place: q.Member.birth_place,
          birth_date: q.Member.birth_date ? moment(q.Member.birth_date).format("YYYY-MM-DD") : null,
          whatsapp_number: q.Member.whatsapp_number,
          nomor_passport: q.nomor_passport,
          kelurahan_id: alamat.kelurahan_id,
          kecamatan_id: alamat.kecamatan_id,
          kabupaten_id: alamat.kabupaten_kota_id,
          provinsi_id: alamat.provinsi_id,
          nama_ayah: q.nama_ayah,
          nama_passport: q.nama_passport,
          tanggal_di_keluarkan_passport: q.tanggal_di_keluarkan_passport ? moment(q.tanggal_di_keluarkan_passport).format("YYYY-MM-DD") : null,
          tempat_di_keluarkan_passport: q.tempat_di_keluarkan_passport,
          masa_berlaku_passport: q.masa_berlaku_passport ? moment(q.masa_berlaku_passport).format("YYYY-MM-DD") : null,
          kode_pos: q.kode_pos,
          nomor_telephone: q.nomor_telephone,
          email: q.email,
          pengalaman_haji: q.pengalaman_haji,
          tahun_haji: q.tahun_haji,
          pengalaman_umrah: q.pengalaman_umrah,
          tahun_umrah: q.tahun_umrah,
          desease: q.desease,
          last_education: q.last_education,
          blood_type: q.blood_type,
          documents: [
            { type: 'photo_4_6', value: q.photo_4_6 ? true : false },
            { type: 'photo_3_4', value: q.photo_3_4 ? true : false },
            { type: 'fc_passport', value: q.fc_passport ? true : false },
            { type: 'fc_kk', value: q.fc_kk ? true : false },
            { type: 'fc_ktp', value: q.fc_ktp ? true : false },
            { type: 'buku_nikah', value: q.buku_nikah ? true : false },
            { type: 'akte_lahir', value: q.akte_lahir ? true : false },
            { type: 'buku_kuning', value: q.buku_kuning ? true : false },
          ],
          mst_pekerjaan_id: q.mst_pekerjaan_id,
          profession_instantion_name: q.profession_instantion_name,
          profession_instantion_address: q.profession_instantion_address,
          profession_instantion_telephone: q.profession_instantion_telephone,
          keterangan: q.keterangan,
          nama_keluarga: q.nama_keluarga,
          alamat_keluarga: q.alamat_keluarga,
          telephone_keluarga: q.telephone_keluarga,
          status_nikah: q.status_nikah,
          tanggal_nikah: q.tanggal_nikah ? moment(q.tanggal_nikah).format("YYYY-MM-DD") : null,
          kewarganegaraan: q.kewarganegaraan,
        };
      }

      console.log("dataa info update: ", data)

      return {
        data: data,
        total: data.count
      }
    } catch (error) {
      console.error("ERROR: daftar_jamaah()", error);
      return { data: [], total: 0 };
    }
  }
  
  async as341242342() {
    await this.initialize();
    const body = this.req.body;
    const limit = body.perpage || 10;
    const page = body.pageNumber && body.pageNumber !== "0" ? body.pageNumber : 1;
    const filterCabang = body.filterCabang || null;

    let where = {};

    if (filterCabang) {
      where = { ...where, division_id: filterCabang };
    } else {
      where = { ...where, division_id: this.division_id};
    }

    if (body.search) {
      where = {
        ...where,
        [Op.or]: [
          { '$Member.fullname$': { [Op.like]: `%${body.search}%` } },
          { '$Member.identity_number$': { [Op.like]: `%${body.search}%` } },
        ],
      };
    }

    const sql = {
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["id", "ASC"]],
s
    };

    try {
      const q = await Jamaah.findAndCountAll(sql); // Cari data dari Jamaah
      const total = q.count;
      let data = [];

      if (total > 0) {
        data = q.rows.map((jamaah) => {
          const member = jamaah.Member || {}; // Ambil Member terkait Jamaah
          const agen = jamaah.Agen || {}; // Ambil Agen terkait Jamaah
          const agenMember = agen.Member || {}; // Ambil Member terkait Agen

          return {
            id: jamaah.id,
            identity_number: member.identity_number,
            nomor_passport: jamaah.nomor_passport,
            fullname: member.fullname ,
            birth_place:member.birth_place,
            birth_date: member.birth_date,
          };
        });
      }

      return {
        data: data,
        total: total,
      };
    } catch (error) {
      console.error("ERROR: daftar_jamaah()", error);
      return { data: [], total: 0 };
    }
  }

  async download_jamaah() {
    const division_id = await this.getDivisionId();

    let where = {division_id};

    const sql = {
      order: [["id", "ASC"]],
      where: where,
      attributes: [
        "nomor_passport",
        "nama_ayah",
        "nama_passport",
        "tanggal_di_keluarkan_passport",
        "tempat_di_keluarkan_passport",
        "masa_berlaku_passport",
        "nomor_telephone",
        "last_education",
        "mst_pekerjaan_id",
        "telephone_keluarga",
        "status_nikah",
        "kewarganegaraan",
        "title",
      ],
      include: [
        {
          model: Member,
          attributes: [
            "fullname",
            "identity_number",
            "identity_type",
            "birth_date",
            "birth_place",
          ],
        },
        {
          model: Mst_pekerjaan, 
    
          attributes: ["name"], 
        },
        {
          model: Mst_pendidikan, 
          attributes: ["name"],
        },
      ],
    };
    try {
      const q = await Jamaah.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        data = q.rows.map((jamaah) => {
          const member = jamaah.Member || {};
          const pekerjaan = jamaah.Mst_pekerjaan || {};
          const pendidikan = jamaah.Mst_pendidikan || {};
      
          return {
            nama_jamaah: member.fullname || "-",
            nomor_identitas: member.identity_number || "-",
            jenis_identitas: member.identity_type || "-",
            tempat_lahir: member.birth_place || "-",
            tanggal_lahir: member.birth_date
              ? moment(member.birth_date).locale("id").format("DD MMMM YYYY")
              : "-",
            nomor_passport: jamaah.nomor_passport || "-",
            nama_passport: jamaah.nama_passport || "-",
            nama_ayah: jamaah.nama_ayah || "-",
            tanggal_dikeluarkan_passport: jamaah.tanggal_di_keluarkan_passport || "-",
            tempat_dikeluarkan_passport: jamaah.tempat_di_keluarkan_passport || "-",
            masa_berlaku_passport: jamaah.masa_berlaku_passport || "-",
            nomor_telephone: jamaah.nomor_telephone || "-",
            telephone_keluarga: jamaah.telephone_keluarga || "-",
            status_nikah: jamaah.status_nikah || "-",
            kewarganegaraan: jamaah.kewarganegaraan || "-",
            title: jamaah.title || "-",
            nama_pekerjaan: pekerjaan.name || "-",
            nama_pendidikan: pendidikan.name || "-",
          };
        });
      }
      return {
        data: data,
        total: total,
      };
    } catch (error) {
      console.error("ERROR: daftar_jamaah()", error);
      return { data: [], total: 0 };
    }
  }

  async exportToExcel(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Jamaah");

    // Define kolom header
    worksheet.columns = [
      { header: "Nama Jamaah", key: "nama_jamaah", width: 25 },
      { header: "Nomor Identitas", key: "nomor_identitas", width: 20 },
      { header: "Jenis Identitas", key: "jenis_identitas", width: 15 },
      { header: "Tempat Lahir", key: "tempat_lahir", width: 20 },
      { header: "Tanggal Lahir", key: "tanggal_lahir", width: 20 },

      { header: "Nomor Passport", key: "nomor_passport", width: 20 },
      { header: "Nama Passport", key: "nama_passport", width: 25 },
      { header: "Nama Ayah", key: "nama_ayah", width: 25 },
      { header: "Tanggal Dikeluarkan Passport", key: "tanggal_dikeluarkan_passport", width: 25 },
      { header: "Tempat Dikeluarkan Passport", key: "tempat_dikeluarkan_passport", width: 25 },
      { header: "Masa Berlaku Passport", key: "masa_berlaku_passport", width: 25 },

      { header: "Nomor Telephone", key: "nomor_telephone", width: 20 },
      { header: "Telephone Keluarga", key: "telephone_keluarga", width: 20 },
      { header: "Status Nikah", key: "status_nikah", width: 15 },
      { header: "Kewarganegaraan", key: "kewarganegaraan", width: 15 },
      { header: "Title", key: "title", width: 10 },

      { header: "Pekerjaan", key: "nama_pekerjaan", width: 25 },
      { header: "Pendidikan Terakhir", key: "nama_pendidikan", width: 25 },
    ];

    // Tambahkan data ke worksheet
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async download_jamaah_excel(req, res) {
    try {
      await this.initialize();

      console.log("Downloading Jamaah...");
      console.log(this.req.body);
      
      const result = await this.download_jamaah();
      const buffer = await this.exportToExcel(result.data);

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=Data_Jamaah.xlsx");

      res.send(buffer);
    } catch (error) {
      console.error("Error download_jamaah_excel():", error);
      res.status(500).send({ error: true, message: error.message });
    }
  }
}

module.exports = Model_r;
