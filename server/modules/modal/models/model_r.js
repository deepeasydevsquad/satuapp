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
      const modal_awal = await akuntansi.saldo_modal_awal(body.periode, body.cabang);

      const q1 = await Jurnal.findAndCountAll({ 
        where : { 
          division_id: body.cabang, 
          periode_id: body.periode,
        },
        order : [["createdAt", "asc"]]
      });

      var penambahan_modal = 0;
      var pengurangan_modal = 0;
      await Promise.all(
        await q1.rows.map(async (e) => {
          if(e.akun_kredit == '31000') {
            penambahan_modal  = penambahan_modal + e.saldo;
          }
          if(e.akun_debet == '31000') {
            pengurangan_modal  = pengurangan_modal + e.saldo;
          }
        })
      );

      var iktisar_laba_rugi = await akuntansi.iktisar_laba_rugi(body.periode, body.cabang, this.company_id);
      var modal_akhir = modal_awal + penambahan_modal + iktisar_laba_rugi - pengurangan_modal;

      console.log("------XX------");
      console.log(modal_awal);
      console.log(iktisar_laba_rugi);
      console.log(penambahan_modal);
      console.log(pengurangan_modal);
      console.log(modal_akhir);
      console.log("------XX------");

      return { list : { modal_awal, penambahan_modal, iktisar_laba_rugi, pengurangan_modal, modal_akhir } };
    } catch (error) {
      
      console.log(error);
      console.log("------AA------");
      return {};
    }
  }
}

module.exports = Model_r;
