const { sequelize, Riwayat_deposit_airline, Mst_airline, Mst_bank, Jurnal } = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { menghasilkan_invoice_riwayat_deposit_maskapai } = require("../../../helper/randomHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async add_deposit() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      var akun_kredit = '';
      if(body.sumber_dana == 0) {
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

      const qMaskapai = await Mst_airline.findOne({
          where: {
            id: body.mst_airline_id,
            company_id: this.company_id
          },
      });
      var akun_debet = qMaskapai.nomor_akun_deposit;

      const invoice = await menghasilkan_invoice_riwayat_deposit_maskapai();
      // insert riwayat deposit airlines
      await Riwayat_deposit_airline.create(
        {
          division_id: body.cabang,
          invoice: invoice, 
          sumber_dana: body.sumber_dana, 
          mst_airline_id: body.mst_airline_id,
          deposit: body.deposit,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // insert jurnal
      await Jurnal.create(
        {
          division_id: body.cabang, 
          source: 'depositmaskapai:' + invoice,
          ref: 'Deposit Maskapai',
          ket: 'Deposit Maskapai',
          akun_debet: akun_debet,
          akun_kredit: akun_kredit,
          saldo: body.deposit,
          removable: 'false',
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      
      this.message = `Menambahkan deposit ke Maskapai ${qMaskapai.name} dengan Nomor Invoice: ${invoice} dan Nominal Deposit: ${body.deposit}`;
    } catch (error) {
      this.state = false;
    }
  }


  async delete() {
    await this.initialize();  
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      // get info riwayat deposit airline
      const q = await Riwayat_deposit_airline.findOne({
          where: {
            id: body.id,
            division_id: body.cabang
          },
          include: [
            {
              model: Mst_airline,
              required: true,
              attributes: ['name', 'nomor_akun_deposit'],
            },
          ],
      });

      // delete Riwayat deposit airline 
      var akun_debet = '';
      if(q.sumber_dana == '0') {
        akun_debet = '11010';
      }else{
        const qBank = await Mst_bank.findOne({
          where: {
            id: q.sumber_dana,
            company_id: this.company_id
          },
        });
        akun_debet = qBank.nomor_akun;
      }

      // delete master airlines
      await Riwayat_deposit_airline.destroy(
        {
          where: {
            id: body.id,
            division_id: body.cabang
          },
        },
        {
          transaction: this.t,
        }
      );

      const qJ = await Jurnal.findAndCountAll({
          where: {
            source: 'depositmaskapai:' + q.invoice,
            division_id: body.cabang
          },
      });

      if( qJ.count > 0 ) {
        // tambah di jurnal
        await Jurnal.create(
          {
            division_id: q.division_id, 
            source: 'deletedepositmaskapai:' + q.invoice,
            ref: 'Delete Riwayat Deposit Maskapai',
            ket: 'Delete Riwayat Deposit Maskapai',
            akun_debet: akun_debet,
            akun_kredit: q.Mst_airline.nomor_akun_deposit,
            saldo: q.deposit,
            removable: 'false',
            periode_id: 0,
            createdAt: myDate,
            updatedAt: myDate,
          },
          {
            transaction: this.t,
          }
        );
      }
 
      this.message = `Menghapus riwayat deposit maskapai ${ q.Mst_airline.name } dengan Invoice: ${q.invoice} dan ID: ${body.id}`;
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
