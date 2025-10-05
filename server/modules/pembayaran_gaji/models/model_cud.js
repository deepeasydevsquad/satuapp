const { Pembayaran_gaji, User, Member, Jurnal } = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const {
  menghasilkan_invoice_pembayaran_gaji,
} = require("../../../helper/randomHelper");
const moment = require("moment");
const { sequelize } = require("../../../models");

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
    this.t = await sequelize.transaction();
  }

  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const invoice = await menghasilkan_invoice_pembayaran_gaji();
    try {
      var akun_kredit = '';
      if(body.sumber_dana == 'kas') {
        akun_kredit = '11010'; //
      }else{
        const q = await Mst_bank.findOne({
          where: {
            id: body.sumber_dana,
            company_id: this.company_id
          },
        });
        akun_kredit = q.nomor_akun;
      }

      await Pembayaran_gaji.create(
        {
          division_id: body.division_id,
          sumber_dana: body.sumber_dana == 'kas' ? 0 : body.sumber_dana,
          user_id: body.user_id,
          invoice: invoice,
          nominal: body.nominal,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // jurnal
      const qUser = await User.findOne({
        where: {
          id: body.user_id,
          division_id: body.division_id
        },
        include: {
          model: Member,
          required: true
        }
      });

      // insert jurnal
      await Jurnal.create(
        {
          division_id: body.division_id, 
          source: 'pembayarangaji:' + invoice,
          ref: 'Pembayaran Gaji User ' + qUser.Member.fullname,
          ket: 'Pembayaran Gaji User ' + qUser.Member.fullname,
          akun_debet: '60001',
          akun_kredit: akun_kredit,
          saldo: body.nominal,
          removable: 'false',
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Pembayaran Gaji User ${qUser.Member.fullname} berhasil ditambahkan.`;
    } catch (error) {
      this.state = false;
      this.message = error.message;
    }
  }

  async delete() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    try {
      
      const qPembayaranGaji = await Pembayaran_gaji.findOne({
        where: {
          id: body.id,
        },
        include: {
          model: User,
          required: true, 
          include: {
            model: Member,
            required: true
          }
        }
      });

      console.log("**************");
      console.log(body.id);
      console.log(qPembayaranGaji.sumber_dana);
      console.log("**************");

      var akun_debet = '';
      if(qPembayaranGaji.sumber_dana == 0) {
        akun_debet = '11010'; // kas
      }else{
        const q = await Mst_bank.findOne({
          where: {
            id: qPembayaranGaji.sumber_dana,
            company_id: this.company_id
          },
        });
        akun_debet = q.nomor_akun; 
      }
      // pembayaran gaji
      await Pembayaran_gaji.destroy(
        {
          where: {
            id: body.id,
          },
        },
        {
          transaction: this.t,
        }
      );
      // jurnal
      await Jurnal.create(
        {
          division_id: qPembayaranGaji.division_id, 
          source: 'pengembalianpembayarangaji:' + qPembayaranGaji.invoice,
          ref: 'Menghapus Pembayaran Gaji User ' + qPembayaranGaji.User.Member.fullname,
          ket: 'Menghapus Pembayaran Gaji User ' + qPembayaranGaji.User.Member.fullname,
          akun_debet: akun_debet,
          akun_kredit: '60001',
          saldo: qPembayaranGaji.nominal,
          removable: 'false',
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = "Pembayaran Gaji berhasil dihapus.";
    } catch (error) {

      console.log("____________________");
      console.log(error);
      console.log("____________________");
      this.state = false;
      this.message = error.message;
    }
  }

  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, { msg: this.message });
      await this.t.commit();
      return true;
    } else {
      await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
