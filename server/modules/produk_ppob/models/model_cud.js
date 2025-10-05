const {
  sequelize,
  Ppob_prabayar_markup_company,
  Ppob_pascabayar_markup_company,
} = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const {
  getCompanyIdByCode,
  tipe,
  getCabang,
} = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.company_id = null;
    this.division_id;
    this.message = "";
    this.t = null;
    this.state = true;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.t = await sequelize.transaction();
  }

  async tambah_markup() {
    await this.initialize();
    const body = this.req.body;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      if (body.tipe === "prabayar") {
        await Ppob_prabayar_markup_company.create(
          {
            company_id: this.company_id,
            ppob_prabayar_produk_id: body.id,
            markup: body.markup,
            createdAt: date,
            updatedAt: date,
          },
          { transaction: this.t }
        );
      } else if (body.tipe === "pascabayar") {
        await Ppob_pascabayar_markup_company.create(
          {
            company_id: this.company_id,
            ppob_pascabayar_produk_id: body.id,
            markup: body.markup,
            createdAt: date,
            updatedAt: date,
          },
          { transaction: this.t }
        );
      } else {
        throw new Error("Tipe tidak valid. Harus 'prabayar' atau 'pascabayar'");
      }

      this.message = "Markup berhasil ditambahkan";
    } catch (error) {
      console.error(error);
      this.state = false;
    }
  }

  async hapus_markup() {
    await this.initialize();
    const body = this.req.body;

    try {
      if (body.tipe === "prabayar") {
        await Ppob_prabayar_markup_company.destroy({
          where: {
            company_id: this.company_id,
            ppob_prabayar_produk_id: body.id,
          },
          transaction: this.t,
        });
      } else if (body.tipe === "pascabayar") {
        await Ppob_pascabayar_markup_company.destroy({
          where: {
            company_id: this.company_id,
            ppob_pascabayar_produk_id: body.id,
          },
          transaction: this.t,
        });
      } else {
        throw new Error("Tipe tidak valid. Harus 'prabayar' atau 'pascabayar'");
      }

      this.message = "Markup berhasil dihapus";
    } catch (error) {
      console.error(error);
      this.state = false;
      this.message = "Gagal menghapus markup";
    }
  }

  async response() {
    if (this.state) {
      if (this.t) {
        await writeLog(this.req, this.t, { msg: this.message });
        await this.t.commit();
      }
      return true;
    } else {
      if (this.t) await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
