const { sequelize, Jurnal, Op } = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang, getSeluruhCabangId, tipe } = require("../../../helper/companyHelper");
// 
class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.division_id;
    this.type;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.type = await tipe(this.req);
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
  }
  
  // delete Jurnal
  async delete() {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    try {

      var where = { id : body.id };

      if( this.type === 'administrator') {
        const divisionId = await getSeluruhCabangId(this.company_id);
        where = {...where,...{division_id : { [Op.in]: divisionId }} };
      }else{
        where = {...where,...{division_id :  this.division_id } };
      }
      
      // delete jurnal
      await Jurnal.destroy(
        {
          where: where
        },
        { transaction: this.t }
      );
      // write log message
      this.message = `Menghapus Data Jurnal dengan ID Jurnal : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // response
  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, {
        msg: this.message,
      });
      // commit
      await this.t.commit();
      return true;
    } else {
      // rollback
      await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
