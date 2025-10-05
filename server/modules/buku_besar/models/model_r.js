const { Op, Jurnal, Akun_secondary, Akun_primary, Saldo_akun } = require("../../../models");
const{ getCompanyIdByCode, tipe, getCabang } = require("../../../helper/companyHelper");
const{ convertToRP } = require("../../../helper/currencyHelper");
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

  async get_nomor_akun_secondary(id) {
      var data = '';
      await Akun_secondary.findOne({ 
        where: { 
          id: id, 
          company_id: this.company_id 
        }
      }).then(async (e) => {
          if (e) {
              data = e.nomor_akun;
          }
      });
      return data;
  }

  async list() {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    var nomor_akun = await this.get_nomor_akun_secondary(body.akun);
    try {
      var sn = '';
      // get serial number
      await Akun_secondary.findOne({ 
        where: { 
          id: body.akun, 
          company_id: this.company_id 
        }, 
        include: {
          required : true, 
          model: Akun_primary 
        }
      }).then(async (e) => {
          if (e) {
            sn = e.Akun_primary.sn;
          }
      });
      var saldo = 0;
      await Saldo_akun.findOne({ 
        where: { 
          division_id: body.cabang, 
          periode: body.periode
        }, 
        include: {
          required : true, 
          model: Akun_secondary,
          where: {
            id: body.akun, 
            company_id: this.company_id 
          }
        }
      }).then(async (e) => {
          if (e) {
            saldo = e.saldo;
          }
      });

      const { rows } = await Jurnal.findAndCountAll({ 
        where : { 
          division_id: body.cabang, 
          periode_id: body.periode, 
          [Op.or] : [
            { akun_debet: nomor_akun },
            { akun_kredit: nomor_akun }
          ]
        },
        order : [["id", "asc"]]
      });

      var data = [];
      var total_debet = sn == 'D' ? saldo : 0
      var total_kredit = sn == 'K' ? saldo : 0
      await Promise.all(
        await rows.map(async (e) => {
          var akun_kredit = ' 0';
          if(nomor_akun == e.akun_kredit){
            akun_kredit = await convertToRP(e.saldo)
          }

          var akun_debet = ' 0';
          if(nomor_akun == e.akun_debet) {
            akun_debet = await convertToRP(e.saldo)
          }

          if( sn == 'D') {
            if( nomor_akun == e.akun_kredit ) {
              total_kredit = total_kredit + e.saldo;
              saldo = saldo - e.saldo
            }else if( nomor_akun == e.akun_debet ) {
              total_debet = total_debet + e.saldo;
              saldo = saldo + e.saldo
            }
          } else if ( sn == 'K') {
            if( nomor_akun == e.akun_kredit ) {
              saldo = saldo + e.saldo
            }else if( nomor_akun == e.akun_debet ) {
              saldo = saldo - e.saldo
            }
          }

          data.push({
            id: e.id, 
            ref: e.ref, 
            ket: e.ket,
            kredit: akun_kredit,
            debet: akun_debet, 
            saldo: await convertToRP(saldo) , 
            tanggal: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss")
          });
        })
      );

      return { total_debet : await convertToRP(total_debet) , total_kredit: await convertToRP(total_kredit) , saldo_akhir:await convertToRP(saldo) , list: data }
    } catch (error) {
      return {};
    }
  }
}

module.exports = Model_r;
