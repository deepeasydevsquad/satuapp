const { Op, Jurnal, Akun_secondary, Akun_primary, Saldo_akun } = require("../../../models");
const{ getCompanyIdByCode, tipe, getCabang } = require("../../../helper/companyHelper");
const{ convertToRP } = require("../../../helper/currencyHelper");
const Akuntansi = require("../../../library/akuntansi");
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

  async list() {
    await this.initialize();
    const body = this.req.body;
    try {
      const akuntansi = new Akuntansi();
      const saldo_awals = await akuntansi.saldo_awal(body.periode, body.cabang);
      const data_jurnal = await akuntansi.get_jurnal_by_periode(body.periode, body.cabang);
      const list = await akuntansi.total_saldo(body.periode, data_jurnal.akun_debet, data_jurnal.akun_kredit, body.cabang, saldo_awals, this.company_id)
      return { list : list };
    } catch (error) {
      return {};
    }
  }
}

module.exports = Model_r;
