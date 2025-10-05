const { Op, Periode, Akun_secondary, Division } = require("../../../models");
const{ getCompanyIdByCode, tipe, username, getCabang } = require("../../../helper/companyHelper");
const{ dbList } = require("../../../helper/dbHelper");
const{ convertToRP } = require("../../../helper/currencyHelper");

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

  async paramCabang() {
    // initialize dependensi properties
    await this.initialize();
    var data = [];

    try {
      if( this.type === 'administrator' ) {
        const { rows } = await Division.findAndCountAll({ where : { company_id : this.company_id} });
        await Promise.all(
          await rows.map(async (e) => {
            data.push({id: e.id, name: e.name });
          })
        );
      }else{
        const { rows } = await Division.findAndCountAll({ 
          where : { 
            id: this.division, 
            company_id : this.company_id
          } 
        });
        await Promise.all(
          await rows.map(async (e) => {
            data.push({id: e.id,name: e.name });
          })
        );
      }

      // console.log('&&&&&&&&&&&&&&&&&');
      // console.log(data);
      // console.log('&&&&&&&&&&&&&&&&&');
      return data;
    } catch (error) {
      // console.log("******************");
      // console.log(error);
      // console.log("******************");
      return data
    }
   
  }

  async paramAkun() {
    // initialize dependensi properties
    await this.initialize();

    var data = [];
    const { rows } = await Akun_secondary.findAndCountAll({ where : { company_id : this.company_id} });
      await Promise.all(
        await rows.map(async (e) => {
          data.push({id: e.id, name: "(" + e.nomor_akun + ") " + e.nama_akun });
        })
      );
    return data;
  }

  async paramPeriode() {
    // initialize dependensi properties
    await this.initialize();
    
    var data = [{id: 0, name: 'Periode Sekarang' }];
    const { rows } = await Periode.findAndCountAll({ where : { company_id : this.company_id} });
      await Promise.all(
        await rows.map(async (e) => {
          data.push({id: e.id, name: e.name });
        })
      );
    return data;
  }

  async paramListAllCabang() {
    // initialize dependensi properties
    await this.initialize();

    
    try {
      var data = [];
      const { rows } = await Division.findAndCountAll({ where : { company_id : this.company_id} });
      await Promise.all(
        await rows.map(async (e) => {
          data.push({id: e.id, name: e.name });
        })
      );  
      return data;
    } catch (error) {
      console.log("__________________________");
      console.log(error);
      console.log("__________________________");
      return []
    }
    
    
    
  }
}

module.exports = Model_r;
