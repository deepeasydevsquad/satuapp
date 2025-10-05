const FormData = require("form-data");
const moment = require("moment");

const { Op } = require("sequelize");
const Model_cud = require("./model_cud");
const {
  Whatsapp_message,
  Whatsapp_template,
  sequelize,
  Company,
} = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const {
  getCompanyIdByCode,
  getCabang,
} = require("../../../helper/companyHelper");

class Model_r {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.company_id = null;
    this.division_id = null;
    this.message = "";
    this.t = null;
    this.state = true;
  }

  async initialize() {
    this.division_id = await getCabang(this.req);
    this.state = true;
  }

  async get_nomor_company() {
    await this.initialize();
    const data = await Company.findOne({
      where: { division_id: this.division_id },
      attributes: ["whatsapp_device_number"],
    });

    return data;
  }

  async ambil_jumlah_nomor() {
    try {
      const { type } = this.req.body;

      // Inisialisasi array target
      let target = [];

      // Untuk tipe lainnya, ambil dari model_cud
      const modelCud = new Model_cud(this.req);
      switch (type) {
        case "semua_jamaah":
          target = await modelCud.ambil_data_jamaah();
          break;
        case "staff":
          target = await modelCud.ambil_data_staff();
          break;
        case "agen":
          target = await modelCud.ambil_data_agen();
          break;
        case "jamaah_tabungan":
          target = await modelCud.ambil_data_jamaah_tabungan();
          break;
        case "jamaah_utang_koperasi":
          target = await modelCud.jamaah_utang_koperasi();
          break;
        case "jamaah_paket":
          target = await modelCud.jamaah_paket();
          break;
        case "jamaah_sudah_berangkat":
          target = await modelCud.jamaah_sudah_berangkat();
          break;
        default:
          throw new Error(`Tipe pesan ${type} tidak dikenal`);
      }

      // Filter yang punya nomor
      const filtered = target.filter((x) => x.nomor_wa);

      return {
        total: filtered.length,
        data: filtered.map((x) => x.nomor_wa),
      };
    } catch (error) {
      console.log(error);
      return {
        total: 0,
        data: [],
      };
    }
  }

  async get_template_by_type() {
    try {
      const body = this.req.body;
      const template = await Whatsapp_template.findAll({
        where: { type: body.type },
      });

      const data = template.map((item) => {
        return {
          id: item.id,
          name: item.name,
        };
      });
      return data;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async get_initial_data() {
    try {
      console.log("==========================");
      console.log("initial data");
      console.log(this.req.body);
      console.log("==========================");

      const { type } = this.req.body;

      let jumlahNomor = {
        total: 0,
        data: [],
      };

      if (type !== "pesan_biasa") {
        jumlahNomor = await this.ambil_jumlah_nomor();
      }

      const templates = await this.get_template_by_type();

      return {
        jumlah_nomor: jumlahNomor.total,
        nomor_list: jumlahNomor.data,
        templates,
      };
    } catch (error) {
      console.log(error);
      return {
        jumlah_nomor: 0,
        nomor_list: [],
        templates: [],
      };
    }
  }

  async get_message_by_template_id() {
    console.log("==========================");
    console.log("initial data");
    console.log(this.req.body);
    console.log("==========================");
    const body = this.req.body;
    const template = await Whatsapp_template.findOne({
      where: { id: body.template_id },
    });

    const data = {
      id: template.id,
      message: template.message,
    };

    return data;
  }

  async daftar_pesan() {
    await this.initialize();
    try {
      const data = await Whatsapp_message.findAll({
        where: { division_id: this.division_id },
        attributes: [
          "id",
          "type",
          "pesan",
          "status",
          "nomor_asal",
          "createdAt",
        ],
      });

      const formattedData = data.map((item) => ({
        id: item.id,
        nomor_asal: item.nomor_asal,
        jenis: item.type,
        pesan: item.pesan,
        status: item.status,
        tanggal_pengiriman: moment(item.createdAt).format(
          "DD MMMM YYYY, HH:mm"
        ),
      }));
      return formattedData;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

module.exports = Model_r;
