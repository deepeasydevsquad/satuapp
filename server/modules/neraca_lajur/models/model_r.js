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
    // var nomor_akun = await this.get_nomor_akun_secondary(body.akun);
    try {

      // get saldo_awal
      const q1 = await Saldo_akun.findAndCountAll({ 
        where : { 
          division_id: body.cabang, 
          periode: body.periode, 
        },
        order : [["id", "asc"]]
      });

      var saldo_awal = {};
      await Promise.all(
        await q1.rows.map(async (e) => {
          saldo_awal = {...saldo_awal,...{ [e.akun_secondary_id] : e.saldo } };
        })
      );

      const q2 = await Jurnal.findAndCountAll({
        where : { 
          division_id: body.cabang, 
          periode_id: body.periode, 
        },
        order : [["id", "asc"]]
      });

      var akun_debet = {};
      var akun_kredit = {};
      await Promise.all(
        await q2.rows.map(async (e) => {
          // AKUN DEBET
          if(akun_debet[e.akun_debet]) {
            akun_debet[e.akun_debet] = akun_debet[e.akun_debet] + e.saldo;
          }else{
            akun_debet = {...akun_debet,...{[e.akun_debet] : e.saldo } }
          }
          // AKUN KREDIT
          if(akun_kredit[e.akun_kredit]) {
            akun_kredit[e.akun_kredit] = akun_kredit[e.akun_kredit] + e.saldo;
          }else{
            akun_kredit = {...akun_kredit,...{[e.akun_kredit] : e.saldo } }
          }
        })
      );

      const q3 = await Akun_secondary.findAndCountAll({
        where : { 
          company_id: this.company_id, 
        },
        include: {
          required : true,
          model: Akun_primary
        },
        order : [["nomor_akun", "asc"]]
      });

      var total = {};
      var list = []; 
      await Promise.all(
        await q3.rows.map(async (e) => {

          var saldo_awal_debet = (e.Akun_primary.sn == 'D' ? ( !saldo_awal[e.id] ? 0 : saldo_awal[e.id] ) : 0 )
          var saldo_awal_kredit = (e.Akun_primary.sn == 'K' ? ( !saldo_awal[e.id] ? 0 : saldo_awal[e.id] ) : 0 )
          var penyesuaian_akun_debet = ( akun_debet[e.nomor_akun] ? akun_debet[e.nomor_akun] : 0 )
          var penyesuaian_akun_kredit = ( akun_kredit[e.nomor_akun] ? akun_kredit[e.nomor_akun] : 0 )

          if( e.pos == 'NRC') {
            var neraca_debet = saldo_awal_debet + penyesuaian_akun_debet;
            var neraca_kredit = saldo_awal_kredit + penyesuaian_akun_kredit;
            var laba_debet = 0
            var laba_kredit = 0
          } else {
            var neraca_debet = 0;
            var neraca_kredit = 0;
            var laba_debet = saldo_awal_debet + penyesuaian_akun_debet;
            var laba_kredit = saldo_awal_kredit + penyesuaian_akun_kredit;
          }

          // SALDO AWAL DEBET
          if( total['saldo_awal_debet' ] ) {
            total['saldo_awal_debet'] = total['saldo_awal_debet'] + saldo_awal_debet;
          }else{
            total = {...total,...{['saldo_awal_debet'] : saldo_awal_debet }}
          }

          // SALDO AWAL KREDIT
          if( total['saldo_awal_kredit' ] ) {
            total['saldo_awal_kredit'] = total['saldo_awal_kredit'] + saldo_awal_kredit;
          }else{
            total = {...total,...{['saldo_awal_kredit'] : saldo_awal_kredit }}
          }

          // PENYESUAIAN AKUN DEBET
          if( total['penyesuaian_akun_debet' ] ) {
            total['penyesuaian_akun_debet'] = total['penyesuaian_akun_debet'] + penyesuaian_akun_debet;
          }else{
            total = {...total,...{['penyesuaian_akun_debet'] : penyesuaian_akun_debet }}
          }

          // PENYESUAIAN AKUN KREDIT
          if( total['penyesuaian_akun_kredit' ] ) {
            total['penyesuaian_akun_kredit'] = total['penyesuaian_akun_kredit'] + penyesuaian_akun_kredit;
          }else{
            total = {...total,...{['penyesuaian_akun_kredit'] : penyesuaian_akun_kredit }}
          }

          // SALDO DISESUAIKAN DEBET
          if( total['saldo_disesuaikan_debet' ] ) {
            total['saldo_disesuaikan_debet'] = total['saldo_disesuaikan_debet'] + ( saldo_awal_debet + penyesuaian_akun_debet);
          }else{
            total = {...total,...{['saldo_disesuaikan_debet'] : saldo_awal_debet + penyesuaian_akun_debet }}
          }

          // SALDO DISESUAIKAN KREDIT
          if( total['saldo_disesuaikan_kredit' ] ) {
            total['saldo_disesuaikan_kredit'] = total['saldo_disesuaikan_kredit'] + ( saldo_awal_kredit + penyesuaian_akun_kredit);
          }else{
            total = {...total,...{['saldo_disesuaikan_kredit'] : saldo_awal_kredit + penyesuaian_akun_kredit }}
          }

          // NERACA DEBET
          if( total['neraca_debet' ] ) {
            total['neraca_debet'] = total['neraca_debet'] + neraca_debet ;
          }else{
            total = {...total,...{['neraca_debet'] : neraca_debet }}
          }

          // NERACA KREDIT
          if( total['neraca_kredit' ] ) {
            total['neraca_kredit'] = total['neraca_kredit'] + neraca_kredit ;
          }else{
            total = {...total,...{['neraca_kredit'] : neraca_kredit }}
          }

          // LABA DEBET
          if( total['laba_debet' ] ) {
            total['laba_debet'] = total['laba_debet'] + laba_debet ;
          }else{
            total = {...total,...{['laba_debet'] : laba_debet }}
          }

          // LABA KREDIT
          if( total['laba_kredit' ] ) {
            total['laba_kredit'] = total['laba_kredit'] + laba_kredit ;
          }else{
            total = {...total,...{['laba_kredit'] : laba_kredit }}
          }

          list.push({
            sn : e.Akun_primary.sn, 
            akun: e.nomor_akun,
            nama_akun: e.nama_akun,
            debet_saldo_awal: await convertToRP(saldo_awal_debet) ,
            kredit_saldo_awal: await convertToRP(saldo_awal_kredit),
            debet_penyesuaian: await convertToRP(penyesuaian_akun_debet),
            kredit_penyesuaian: await convertToRP(penyesuaian_akun_kredit),
            debet_saldo_disesuaikan: await convertToRP(saldo_awal_debet + penyesuaian_akun_debet),
            kredit_saldo_disesuaikan: await convertToRP(saldo_awal_kredit + penyesuaian_akun_kredit),
            debet_neraca: await convertToRP(neraca_debet),
            kredit_neraca: await convertToRP(neraca_kredit),
            debet_laba_rugi: await convertToRP(laba_debet),
            kredit_laba_rugi: await convertToRP(laba_kredit)
          })
        })
      );

      return { list: list, total: total }
    } catch (error) {
      console.log("-------->");
      console.log(error);
      console.log("-------->");
      return {};
    }
  }
}

//   {
//     "saldo_awal_debet": 0,
//     "saldo_awal_kredit": 0,
//     "penyesuaian_akun_debet": 833000000,
//     "penyesuaian_akun_kredit": 833000000,
//     "saldo_disesuaikan_debet": 833000000,
//     "saldo_disesuaikan_kredit": 833000000,
//     "neraca_debet": 0,
//     "neraca_kredit": 0,
//     "laba_debet": 833000000,
//     "laba_kredit": 833000000
// }

module.exports = Model_r;
