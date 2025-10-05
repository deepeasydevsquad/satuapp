const {Op, Akun_primary, Akun_secondary, Division, Saldo_akun, Jurnal, Periode } = require("../../../models");
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
    Dapatkan id akun secondary
  */
  async get_akun_secondary_id() {
      var akun_secondary_id = {};
      await Akun_secondary.findAll({ 
        where : { 
          company_id : this.company_id,
        }
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
             akun_secondary_id[e.nomor_akun] = e.id; 
          })
        );
      });
      return akun_secondary_id;
  }

  /* 
    Dapatkan data filter pada akun
  */  
  async filter_akun() {
    // initialize dependensi properties
    await this.initialize();
    
    try {
      var akun = [{id : 0, name : 'Pilih Semua Akun'}];
      await Akun_primary.findAll().then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              akun.push({ 
                id : e.id, 
                name : e.nomor_akun + ' | ' + e.nama_akun
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
    
      return { akun, cabang };
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
    Dapatkan akun primary
    @return { [id] : {sn,pos} }
  */
  async get_akun_primary() {
    var data = {};
    await Akun_primary.findAll().then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          data[e.id] = { sn: e.sn, pos : e.pos, name: e.nama_akun, nomor: e.nomor_akun };
        })
      );
    });
    return data;
  }

  /* 
    Dapatkan saldo akhir
    @return { [division_id]: { [nomor_akun] : saldo_akhir } }
  */
  async get_saldo_akhir(division, saldo_awal, saldo_jurnal) {
    var saldo_akhir = {};

    for( let x in division ) {
      if( saldo_awal[division[x]] !== undefined ) {
        for( let y in saldo_awal[division[x]] ) {
          if( saldo_akhir[division[x]] === undefined ) {
            saldo_akhir =  {...saldo_akhir,...{[division[x]] : { [y] : saldo_awal[division[x]][y] } } };
          }else{
            if( saldo_akhir[division[x]][y] === undefined ) {
              saldo_akhir[division[x]] = {...saldo_akhir[division[x]],...{[y] : saldo_awal[division[x]][y] } };
            }else{
              saldo_akhir[division[x]][y] = saldo_akhir[division[x]][y] + saldo_awal[division[x]][y];
            }
          }
        }
      }

      if( saldo_jurnal[division[x]] !== undefined ) {
        for( let y in saldo_jurnal[division[x]] ) {
          if( saldo_akhir[division[x]] === undefined ) {
            saldo_akhir =  {...saldo_akhir,...{[division[x]] : { [y] : saldo_jurnal[division[x]][y] } } };
          }else{
            if( saldo_akhir[division[x]][y] === undefined ) {
              saldo_akhir[division[x]] = {...saldo_akhir[division[x]],...{[y] : saldo_jurnal[division[x]][y] } };
            }else{
              saldo_akhir[division[x]][y] = saldo_akhir[division[x]][y] + saldo_jurnal[division[x]][y];
            }
          }
        }
      }
    }
    return saldo_akhir;
  }

  /* 
    Dapatkan saldo jurnal by division
    @return { [division_id] : { [akun_debet|akun_kredit]: saldo_jurnal } }
  */
  async get_saldo_jurnal(akun_primary, division ) {
    var saldo_jurnal = {};
    await Jurnal.findAll({ where : { division_id : { [Op.in] : division }, periode_id : 0 }}).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            // info akun
            if( e.akun_debet != null ) {
              var infAkunDebet =  akun_primary[e.akun_debet.toString().charAt(0)];
              if( infAkunDebet.sn == 'D') {
                if(saldo_jurnal[e.division_id] === undefined ) {
                  saldo_jurnal = {...saldo_jurnal,...{[e.division_id] : { [e.akun_debet] : ( e.saldo + 0 ) } } };
                }else{
                  if( saldo_jurnal[e.division_id][e.akun_debet] === undefined ) {
                    saldo_jurnal[e.division_id] = {...saldo_jurnal[e.division_id],...{[e.akun_debet] : (e.saldo + 0)}}
                  }else{
                    saldo_jurnal[e.division_id][e.akun_debet] = saldo_jurnal[e.division_id][e.akun_debet] + e.saldo;
                  }
                }
              }else if ( infAkunDebet.sn == 'K' ) {
                if(saldo_jurnal[e.division_id] === undefined ) {
                  saldo_jurnal = {...saldo_jurnal,...{[e.division_id] : { [e.akun_debet] : ( 0 - e.saldo ) } } };
                }else{
                  if( saldo_jurnal[e.division_id][e.akun_debet] === undefined ) {
                    saldo_jurnal[e.division_id] = {...saldo_jurnal[e.division_id],...{[e.akun_debet] : ( 0 - e.saldo )}}
                  }else{
                    saldo_jurnal[e.division_id][e.akun_debet] = saldo_jurnal[e.division_id][e.akun_debet] - e.saldo;
                  }
                }
              }
            }

            if(e.akun_kredit != null ) {
              var infAkunKredit =  akun_primary[e.akun_kredit.toString().charAt(0)];
              if( infAkunKredit.sn == 'D') {
                if(saldo_jurnal[e.division_id] === undefined ) {
                  saldo_jurnal = {...saldo_jurnal,...{[e.division_id] : { [e.akun_kredit] : ( 0 - e.saldo ) } } };
                }else{
                  if( saldo_jurnal[e.division_id][e.akun_kredit] === undefined ) {
                    saldo_jurnal[e.division_id] = {...saldo_jurnal[e.division_id],...{[e.akun_kredit] : (0 - e.saldo)}}
                  }else{
                    saldo_jurnal[e.division_id][e.akun_kredit] = saldo_jurnal[e.division_id][e.akun_kredit] - e.saldo;
                  }
                }
              }else if ( infAkunKredit.sn == 'K' ) {
                if(saldo_jurnal[e.division_id] === undefined ) {
                  saldo_jurnal = {...saldo_jurnal,...{[e.division_id] : { [e.akun_kredit] : ( e.saldo + 0 ) } } };
                }else{
                  if( saldo_jurnal[e.division_id][e.akun_kredit] === undefined ) {
                    saldo_jurnal[e.division_id] = {...saldo_jurnal[e.division_id],...{[e.akun_kredit] : ( e.saldo + 0 )}}
                  }else{
                    saldo_jurnal[e.division_id][e.akun_kredit] = saldo_jurnal[e.division_id][e.akun_kredit] + e.saldo;
                  }
                }
              }
            }
          })
        );
    });
   
    return saldo_jurnal;
  }

  /* 
    Dapatkan saldo awal
  */  
  async get_saldo_awal(division) {
    var data = {};
    await Saldo_akun.findAll({ 
      include: { 
        required : true, 
        model: Akun_secondary 
      }, 
      where : { 
        division_id : { [Op.in] : division },
        periode : 0 
      }
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          if(data[e.division_id] === undefined ) {
            data = {...data,...{[e.division_id] : { [e.Akun_secondary.nomor_akun] : e.saldo } } };
          }else{
            if(data[e.division_id][e.Akun_secondary.nomor_akun] === undefined ) {
              data[e.division_id] = {...data[e.division_id],...{ [e.Akun_secondary.nomor_akun] : e.saldo } };
            }else{
              data[e.division_id][e.Akun_secondary.nomor_akun] = data[e.division_id][e.Akun_secondary.nomor_akun] + e.saldo;
            }
          }
        })
      );
    });
    return data;
  }

  /* 
    Dapatkan akun secondary
  */
  async get_akun_secondary() {
     // initialize dependensi properties
     await this.initialize();

    var data = {};
    await Akun_secondary.findAll({ 
      where : { company_id : this.company_id }
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          data[e.nomor_akun] = e.id;
        })
      );
    });
    return data;
  }

  /* 
    Dapatkan daftar akun by company and division
  */
  async get_daftar_akun() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;
    const cabang = body.cabang;
    try {
      var where_akun_primary = {};
      if( body.akun !== undefined && body.akun != '0') {
        where_akun_primary = {...where_akun_primary,...{ id : body.akun } };
      }
      var devision_id = [];
      // get saldo akun
      if( this.type === 'administrator' && cabang == '0'  ) {
        devision_id = await this.get_seluruh_cabang_id();
      }else{
        devision_id.push(cabang);
      }

      const akun_primary = await this.get_akun_primary();
      const saldo_jurnal = await this.get_saldo_jurnal(akun_primary, devision_id );
      const akun_secondary_id = await this.get_akun_secondary();

      var list_saldo_jurnal = {};
      var total_akun_primary = {};
      if( Object.keys(saldo_jurnal).length > 0 ) {
        for( let x in akun_secondary_id ) {
          console.log(cabang);
          console.log(typeof x);
          list_saldo_jurnal[akun_secondary_id[x]] = saldo_jurnal[cabang][x] !== undefined ? saldo_jurnal[cabang][x] : 0 ;
          var primary_id = x.toString().charAt(0);
          if(total_akun_primary[primary_id] === undefined ) {
            total_akun_primary = {...total_akun_primary,...{ [primary_id] : ( saldo_jurnal[cabang][x] !== undefined ?  saldo_jurnal[cabang][x] : 0 ) } };
          }else{
            total_akun_primary[primary_id] = total_akun_primary[primary_id] + ( saldo_jurnal[cabang][x] !== undefined ?  saldo_jurnal[cabang][x] : 0 ) ;
          }
        }
      }

      var saldo_akun_primary = {};
      var saldo_akun_secondary = {};
      await Saldo_akun.findAll( {
        include : {
          required : true, 
          model : Akun_secondary
        },  
        where : { division_id : devision_id, periode : '0' } }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            // menghitung jumlah saldo akun secondary
            if(saldo_akun_secondary[e.akun_secondary_id] === undefined ) {
              saldo_akun_secondary = {...saldo_akun_secondary,...{[e.akun_secondary_id] : e.saldo}}
            }else{
              saldo_akun_secondary[e.akun_secondary_id] = parseInt(saldo_akun_secondary[e.akun_secondary_id]) + e.saldo;
            }
            // menghitung jumlah saldo akun primary
            if ( saldo_akun_primary[e.Akun_secondary.akun_primary_id] === undefined ) {
              saldo_akun_primary = {...saldo_akun_primary,...{[e.Akun_secondary.akun_primary_id] : e.saldo}}
            }else{
              saldo_akun_primary[e.Akun_secondary.akun_primary_id] = parseInt(saldo_akun_primary[e.Akun_secondary.akun_primary_id]) + e.saldo;
            }
          })
        );
      });

      var draf = {};
      await Akun_secondary.findAll({ 
        where : { company_id : this.company_id},
        include : {
          required : true, 
          model : Akun_primary,
          where : where_akun_primary
        }
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            var saldo_jurnal_secondary = list_saldo_jurnal[e.id] === undefined ? 0 : list_saldo_jurnal[e.id];
            var saldo_awal_secondary = saldo_akun_secondary[e.id] === undefined ? 0 : saldo_akun_secondary[e.id];
            var saldo_akhir_secondary = saldo_jurnal_secondary + saldo_awal_secondary;
            var rp_saldo_awal_secondary = await convertToRP(saldo_awal_secondary);
            var rp_saldo_akhir_secondary = await convertToRP(saldo_akhir_secondary);

            if( draf[e.Akun_primary.nomor_akun] === undefined) {
              draf = {...draf,...{[e.Akun_primary.nomor_akun]: { [e.nomor_akun] : { 
                id: e.id, primary_id : e.Akun_primary.id, 
                type: 'child', 
                nomor: e.nomor_akun, 
                name:e.nama_akun,
                tipe_akun: e.tipe_akun,
                saldo_awal: rp_saldo_awal_secondary, 
                saldo_akhir: rp_saldo_akhir_secondary
              }}}};
            }else{
              draf[e.Akun_primary.nomor_akun] = {...draf[e.Akun_primary.nomor_akun],...{[e.nomor_akun] : { 
                id: e.id, primary_id : e.Akun_primary.id, 
                type: 'child', 
                nomor: e.nomor_akun, 
                name:e.nama_akun,
                tipe_akun: e.tipe_akun,
                saldo_awal: rp_saldo_awal_secondary, 
                saldo_akhir: rp_saldo_akhir_secondary
              }}}
            }
          })
        );
      });

      var data = [];
      if( body.akun !== undefined && body.akun != '0') {
        for( let x in akun_primary ){
          if(x !== body.akun) {
            delete akun_primary[x];
          }
        }
      }

      for( let x in akun_primary) {
        var saldo_jurnal_primary = total_akun_primary[x] === undefined ? 0 : total_akun_primary[x];
        var saldo_awal_primary = saldo_akun_primary[x] === undefined ? 0 : saldo_akun_primary[x];
        var saldo_akhir_primary = saldo_jurnal_primary + saldo_awal_primary;
        var rp_saldo_awal_primary = await convertToRP(saldo_awal_primary);
        var rp_saldo_akhir_primary = await convertToRP(saldo_akhir_primary);

        data.push({ 
          id: x, 
          primary_id : x, 
          type: 'header', 
          nomor: akun_primary[x].nomor, 
          name: akun_primary[x].name, 
          tipe_akun : 'bawaan',
          saldo_awal : rp_saldo_awal_primary, 
          saldo_akhir : rp_saldo_akhir_primary,
        });

        for( let y in draf[akun_primary[x].nomor]) {
          data.push( draf[akun_primary[x].nomor][y] );
        }
      }

      return { data };

    } catch (error) {
      console.log("XXXXX");
      console.log(error);
      console.log("XXXXX");
      return {};
    }
  }

  async laba_bersih(saldo_akhir) {
    var laba_bersih = {};
    for( let x in saldo_akhir){
      var total_akun_40000 = 0;
      var total_akun_50000 = 0;
      var total_akun_60000 = 0;
      for( let y in saldo_akhir[x]){
        var prefix = y.toString().charAt(0);
        if(prefix == '4'){
          total_akun_40000 = total_akun_40000 + saldo_akhir[x][y];
        }else if( prefix == '5' ) {
          total_akun_50000 = total_akun_50000 + saldo_akhir[x][y];
        }else if( prefix == '6' ) {
          total_akun_60000 = total_akun_60000 + saldo_akhir[x][y];
        }
      }
      laba_bersih = {...laba_bersih,...{[x]: total_akun_40000 - total_akun_50000 - total_akun_60000 } };
    }
    return laba_bersih;
  }

  async get_last_periode_id() {
    // initialize dependensi properties
    await this.initialize();

    try {
      var id = 0;
      await Periode.findOne({order: [['id', 'DESC']], where: { company_id: this.company_id }}).then(async (e) => {
          if (e) { id = e.id; }
      });
      return id
    } catch (error) {
      return 0
    }
  }

  async count_periode() {
    // initialize dependensi properties
    await this.initialize();
    const { count, rows } = await Periode.findAndCountAll({ where : { company_id : this.company_id } } );
    return count;
  }

}

module.exports = Model_r;
