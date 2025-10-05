const { sequelize, Jurnal, Item_fasilitas, 
  Visa_transaction_detail, Visa_transaction, 
  Hotel_transaction_detail, Hotel_transaction, 
  Transport_transaction_detail, Transport_transaction,
  Passport_transaction_detail, Passport_transaction,
  Ticket_transaction_detail, Ticket_transaction, 
  Division, Transaction_fasilitas_detail, Transaction_fasilitas, 
  Paket_transaction, Fee_agen, Paket,
  Op } = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang, getSeluruhCabangId, tipe } = require("../../../helper/companyHelper");
const moment = require("moment");
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


  async tutupPaket() {
    await this.initialize();
    const body = this.req.body;
    const paket_id = body.paket_id;
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    try {

      // mengambil informasi paket
      var division_paket = 0;
      var kode_paket = '';
      var nama_paket = '';
      const q = await Paket.findAndCountAll({ 
        where : { 
          id : paket_id 
        }, 
        include: { 
          required : true, 
          model: Division, 
          where: { company_id: this.company_id}
        }
      });
      // extract     
      await Promise.all(
        await q.rows.map(async (e) => {
          division_paket = e.division_id;
          kode_paket = e.kode;
          nama_paket = e.name;
        })
      );

      // menghitung fee agen
      var TotalFeeAgen = 0;
      var total_anggaran = 0;
      const q3 = await Paket_transaction.findAndCountAll({ 
        where : { 
          paket_id : paket_id
        }, 
        include: [
          { 
            required : true, 
            model: Division, 
            where: { company_id: this.company_id}
          },
          { 
            required : true, 
            model: Fee_agen, 
          }
        ]
      });
      await Promise.all(
        await q3.rows.map(async (e) => {
          TotalFeeAgen = TotalFeeAgen + e.Fee_agen.nominal;
          total_anggaran = total_anggaran + e.price;
        })
      );
     
      // mengambil informasi total transaksi visa
      var total_rupiah_visa = 0;
      const q4 = await Visa_transaction_detail.findAndCountAll({ 
        include: {
          required : true, 
          model: Visa_transaction, 
          where: { paket_id: paket_id, company_id: this.company_id },
        }
      });
      await Promise.all(
        await q4.rows.map(async (e) => {
          total_rupiah_visa = total_rupiah_visa + e.price;
        })
      );

      // mengambil informasi total transaksi hotel
      var total_rupiah_hotel = 0;
      const q5 = await Hotel_transaction_detail.findAndCountAll({ 
        include: {
          required : true, 
          model: Hotel_transaction, 
          where: { paket_id: paket_id, company_id: this.company_id },
        }
      });
      await Promise.all(
        await q5.rows.map(async (e) => {
          total_rupiah_hotel = total_rupiah_hotel + e.price;
        })
      );

      // mengambil informasi total transaksi Transport
      var total_rupiah_transport = 0;
      const q6 = await Transport_transaction_detail.findAndCountAll({ 
        include: {
          required : true, 
          model: Transport_transaction, 
          where: { paket_id: paket_id, company_id: this.company_id },
        }
      });
      await Promise.all(
        await q6.rows.map(async (e) => {
          total_rupiah_transport = total_rupiah_transport + e.price;
        })
      );

      // mengambil informasi total transaksi Passport
      var total_rupiah_passport = 0;
      const q7 = await Passport_transaction_detail.findAndCountAll({ 
        include: {
          required : true, 
          model: Passport_transaction, 
          where: { paket_id: paket_id, company_id: this.company_id },
        }
      });
      await Promise.all(
        await q7.rows.map(async (e) => {
          total_rupiah_passport = total_rupiah_passport + e.price;
        })
      );

      // mengambil informasi total transaksi Tiket
      var total_rupiah_tiket = 0;
      const q8 = await Ticket_transaction_detail.findAndCountAll({ 
        include: {
          required : true, 
          model: Ticket_transaction, 
          where: { paket_id: paket_id },
          include:{
            required : true, 
            model: Division, 
            where: { company_id: this.company_id }
          }
        }
      });
      await Promise.all(
        await q8.rows.map(async (e) => {
          total_rupiah_tiket = total_rupiah_tiket + e.travel_price;
        })
      );

      var total_rupiah_fasilitas = 0;
      const q9 = await Transaction_fasilitas_detail.findAndCountAll({ 
        include:[
          {
            required : true, 
            model: Transaction_fasilitas, 
            where: { paket_id: paket_id },
          },
          {
            required : true, 
            model: Item_fasilitas, 
          }
        ] 
      });

      await Promise.all(
        await q9.rows.map(async (e) => {
          total_rupiah_fasilitas = total_rupiah_fasilitas + e.Item_fasilita.harga_jual;
        })
      );

      const total_aktualisasi = total_rupiah_fasilitas + total_rupiah_tiket + total_rupiah_visa + total_rupiah_hotel + total_rupiah_transport + total_rupiah_passport + TotalFeeAgen ;
      const keuntungan = total_anggaran - total_aktualisasi;

      // insert jurnal mengurangi utang.
      await Jurnal.create(
        {
          division_id: division_paket, 
          source: 'paket:'+kode_paket,
          ref: 'Tutup Paket ' + nama_paket ,
          ket: 'Tutup Paket' + nama_paket,
          akun_debet: '23000',
          akun_kredit: '41000',
          saldo: keuntungan,
          removable: 'false',
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // update paket
      await Paket.update(
        {
          tutup_paket: 'tutup',
          updatedAt: myDate,
        },
        {
          where: { id: paket_id, division_id : division_paket },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menutup paket dengan kode paket ${ kode_paket  } dan nama paket ${ nama_paket }`;
    } catch (error) {

      console.log("xxxxxffff");
      console.log(error);
      console.log("xxxxxffff");
      this.state = false;
    }
  }

  async bukaPaket() {
    await this.initialize();
    const body = this.req.body;
    const paket_id = body.paket_id;
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    try {
      // mengambil informasi paket
      var division_paket = 0;
      var kode_paket = '';
      var nama_paket = '';
      const q = await Paket.findAndCountAll({ 
        where : { 
          id : paket_id 
        }, 
        include: { 
          required : true, 
          model: Division, 
          where: { company_id: this.company_id}
        }
      });
      // extract     
      await Promise.all(
        await q.rows.map(async (e) => {
          division_paket = e.division_id;
          kode_paket = e.kode;
          nama_paket = e.name;
        })
      );

      // delete Jurnal
      await Jurnal.destroy(
        {
          where: {
            source: 'paket:'+kode_paket, 
            division_id: division_paket
          },
        },
        { transaction: this.t }
      );

      // update paket
      await Paket.update(
        {
          tutup_paket: 'buka',
          updatedAt: myDate,
        },
        {
          where: { id: paket_id, division_id : division_paket },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Membuka paket dengan kode paket ${ kode_paket  } dan nama paket ${ nama_paket }`;
    } catch (error) {

      console.log("___________");
      console.log(error);
      console.log("___________");
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
