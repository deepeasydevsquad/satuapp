const { Hotel_transaction, Mst_bank, sequelize, Company, Users, Member, Jurnal, Op, Division } = require("../../../models");
const moment = require("moment");
const { getCompanyIdByCode, tipe, getCabang } = require("../../../helper/companyHelper");
const { writeLog } = require("../../../helper/writeLogHelper");
const { generateNomorInvoiceHotel } = require("../../../helper/randomHelper");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.division_id;
    this.type;
    this.invoice;
  }

  async initialize() {
    this.t = await sequelize.transaction();
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.type = await tipe(this.req);
    this.state = true;
  }

  async tambah_transaksi_hotel() {
    await this.initialize();
    const my_date = moment().format("YYYY-MM-DD HH:mm:ss");
   
    try {
      var akun_kredit = '';
      if(this.req.body.sumber_dana == 0) {
        akun_kredit = '11010'; //
      }else{
        const q = await Mst_bank.findOne({
          where: {
            id: this.req.body.sumber_dana,
            company_id: this.company_id
          },
        });
        akun_kredit = q.nomor_akun;
      }

      this.invoice = await generateNomorInvoiceHotel(this.req.body.cabang);
      const insert = await Hotel_transaction.create(
        {
          division_id: this.req.body.cabang,
          kostumer_id: this.req.body.kostumer == 0 ? null : this.req.body.kostumer, 
          paket_id: this.req.body.paket == 0 ? null : this.req.body.paket, 
          mst_hotel_id: this.req.body.mst_hotel_id, 
          invoice: this.invoice, 
          petugas: this.type, 
          check_in: moment(this.req.body.check_in).format("YYYY-MM-DD"),
          check_out: moment(this.req.body.check_out).format("YYYY-MM-DD"),
          tipe_kamar: this.req.body.tipe_kamar, 
          jumlah_hari: this.req.body.jumlah_hari,
          jumlah_kamar: this.req.body.jumlah_kamar,
          harga_travel_kamar_per_hari: this.req.body.harga_travel_kamar_per_hari,
          harga_kostumer_kamar_per_hari: this.req.body.harga_kostumer_kamar_per_hari,
          createdAt: my_date,
          updatedAt: my_date,
        },
        { transaction: this.t }
      );

      // ===== JURNAL ====
      // insert HPP Jurnal Visa
      await Jurnal.create(
        {
          division_id: this.req.body.cabang, 
          source: 'hotelTransactionId:' + insert.id,
          ref: 'HPP Penjualan Hotel ',
          ket: 'HPP Penjualan Hotel ',
          akun_debet: '53000',
          akun_kredit: akun_kredit,
          saldo: ( this.req.body.jumlah_hari * this.req.body.jumlah_kamar * this.req.body.harga_travel_kamar_per_hari ),
          removable: 'false',
          periode_id: 0,
          createdAt: my_date,
          updatedAt: my_date,
        },
        {
          transaction: this.t,
        }
      );
      // insert Pendapatan Jurnal Visa
      await Jurnal.create(
        {
          division_id: this.req.body.cabang, 
          source: 'hotelTransactionId:' + insert.id,
          ref: 'Pendapatan Penjualan Hotel ',
          ket: 'Pendapatan Penjualan Hotel ',
          akun_debet: '11010',
          akun_kredit: '44000',
          saldo: ( this.req.body.jumlah_hari * this.req.body.jumlah_kamar * this.req.body.harga_kostumer_kamar_per_hari ),
          removable: 'false',
          periode_id: 0,
          createdAt: my_date,
          updatedAt: my_date,
        },
        {
          transaction: this.t,
        }
      );

      // tambah pengurangan utang tabungan
      if( this.req.body.paket != 0 ) {
        await Jurnal.create(
          {
            division_id: this.req.body.cabang, 
            source: 'hotelTransactionId:' + insert.id,
            ref: 'Pembayaran Utang Tabungan Untuk Penjualan Hotel ',
            ket: 'Pembayaran Utang Tabungan Untuk Penjualan Hotel ',
            akun_debet: '23000',
            akun_kredit: null,
            saldo: ( this.req.body.jumlah_hari * this.req.body.jumlah_kamar * this.req.body.harga_kostumer_kamar_per_hari ),
            removable: 'false',
            periode_id: 0,
            createdAt: my_date,
            updatedAt: my_date,
          },
          {
            transaction: this.t,
          }
        );
      }

      // message
      this.message = `Melakukan transaksi hotel dengan nomor invoice ${this.invoice}`;
    } catch (error) {
      this.message = "Gagal simpan transaksi hotel: " + error.message;
      this.state = false;
      console.error(error);
    }
  }

  async hapus_transaksi_hotel() {
    await this.initialize();

    const { id } = this.req.body;

    try {
      const transaksi = await Hotel_transaction.findOne({
        where: {
          id: this.req.body.id,
        },
        include: {
          model: Division,
          required: true, 
          where: { company_id: this.company_id }
        }
      });

      if (!transaksi) {
        this.state = false;
        this.message = "Transaksi hotel tidak ditemukan.";
        return;
      }


      // Hapus data hotel
      await Hotel_transaction.destroy({
        where: { id: transaksi.id },
        include: {
          model: Division,
          required: true, 
          where: { company_id: this.company_id }
        },
        transaction: this.t,
      });

      // Hapus data jurnal
      await Jurnal.destroy({
        where: { source: 'hotelTransactionId:' +  transaksi.id },
        transaction: this.t,
      });

      this.message = "Transaksi hotel berhasil dihapus.";

    } catch (error) {
      this.state = false;
      this.message = "Gagal hapus transaksi hotel: " + error.message;
      console.error(error);
    }
  }

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
