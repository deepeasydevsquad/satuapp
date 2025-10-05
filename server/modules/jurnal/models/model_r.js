const moment = require("moment");
const {Akun_secondary, Division, Jurnal, Periode } = require("../../../models");
const{ getCompanyIdByCode, tipe, getCabang } = require("../../../helper/companyHelper");
const{ convertToRP } = require("../../../helper/currencyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.type;
    this.cabang_id;
  }

  /* 
    Initialitation function
  */
  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.type = await tipe(this.req);
    this.cabang_id = await getCabang(this.req);
  }

  /* 
    Dapatkan name akun secondary by kode akun
  */
  async get_akun_secondary() {
      var akun_secondary = {};
      await Akun_secondary.findAll({ 
        where : { 
          company_id : this.company_id,
        }
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            akun_secondary[e.nomor_akun] = e.nama_akun; 
          })
        );
      });
      return akun_secondary;
  }

  /* 
    Dapatkan data filter pada akun
  */  
  async filter() {
    // initialize dependensi properties
    await this.initialize();
    
    try {

      var periode = [{id : 0, name : 'Periode Sekarang'}];
      await Periode.findAll( { where : { company_id : this.company_id } } ).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              periode.push({ 
                id : e.id, 
                name : e.name
              });
            })
          );
      });

      var cabang = [];
      var where_cabang = { company_id: this.company_id };
      if( this.type !== 'administrator' ) {
        where_cabang = {...where_cabang,...{company_id: this.company_id, id : this.cabang_id}}
      }

      await Division.findAll( { where : where_cabang }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            cabang.push({ 
              id : e.id, 
              name : e.name
            });
          })
        );
      });
    
      return { periode, cabang };
    } catch (error) {
      return {}
    }
  }

  /* 
    Dapatkan seluruh id cabang dengan menggunakan id company
    @return [id]
  */
  async get_seluruh_cabang_id (  ) {
    // initialize dependensi properties
    await this.initialize();

    var data = [];
    await Division.findAll( { where : { company_id : this.company_id } }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          data.push(e.id);
        })
      );
    });
    return data;
  }

  /* 
    Dapatkan daftar akun by company and division
  */
  async server_side() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;
    const periode = body.periode;
    const cabang = body.cabang;
    try {
      var devision_id = [];
      // get saldo akun
      if( this.type === 'administrator' && cabang == '0'  ) {
        devision_id = await this.get_seluruh_cabang_id();
      }else{
        devision_id.push(cabang);
      }
      const akun_secondary = await this.get_akun_secondary();
      const { count, rows } = await Jurnal.findAndCountAll({ where : { division_id : devision_id, periode_id : periode }  });
      var data = [];
      await Promise.all(
        await rows.map(async (e) => {
          var saldo = await convertToRP(e.saldo);
          data.push({
            id: e.id,
            source : e.source,
            ref : e.ref,
            ket : e.ket,
            akun_debet_name: akun_secondary[e.akun_debet], 
            akun_debet: e.akun_debet, 
            akun_kredit_name: akun_secondary[e.akun_kredit], 
            akun_kredit: e.akun_kredit, 
            saldo: saldo,
            removable: this.type === 'administrator' ? e.removable : 'false',
            createdAt: moment(e.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          });
        })
      );
      return { data: data, total: count };
    } catch (error) {
      return {};
    }
  }

}

module.exports = Model_r;
