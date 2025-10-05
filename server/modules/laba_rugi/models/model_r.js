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

  async list() {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
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
      var akun_primary = [ 4, 5, 6 ];
      var list = {};
      for( var x in akun_primary ) {
        const { rows } = await Akun_secondary.findAndCountAll({ 
          where : {
            company_id: this.company_id
          }, 
          include: {
            required : true,
            model: Akun_primary,
            where: { 
              id : akun_primary[x], 
            }
          },  
          order : [["nomor_akun", "asc"]]
        });
        await Promise.all(
          await rows.map(async (e) => {
            var saldo = 0;
            if(saldo_awal[e.id]) {
              saldo = saldo + saldo_awal[e.id];
            }
            if( e.Akun_primary.sn == 'D') {
              if( akun_debet[e.nomor_akun] ) {
                saldo = saldo + akun_debet[e.nomor_akun];
              }
              if( akun_kredit[e.nomor_akun] ) {
                saldo = saldo - akun_kredit[e.nomor_akun];
              }
            } else if (e.Akun_primary.sn == 'K' ) {
              if( akun_debet[e.nomor_akun] ) {
                saldo = saldo - akun_debet[e.nomor_akun];
              }
              if( akun_kredit[e.nomor_akun] ) {
                saldo = saldo + akun_kredit[e.nomor_akun];
              }
            }
            var newSaldo = await convertToRP(saldo);
            if( list[e.Akun_primary.nama_akun] ) {
              list[e.Akun_primary.nama_akun].push({ nomor_akun : e.nomor_akun, nama_akun: e.nama_akun, saldo: newSaldo, real_saldo: saldo });
            }else{
              list = {...list,...{[e.Akun_primary.nama_akun] : [{ nomor_akun : e.nomor_akun, nama_akun: e.nama_akun, saldo: newSaldo, real_saldo: saldo}] } };
            }
          })
        );
      }
      return { list : list };
    } catch (error) {
      return {};
    }
  }
}

module.exports = Model_r;
