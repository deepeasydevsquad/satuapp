const moment = require("moment");
const { Paket, Division, Paket_transaction, Paket_price, Mst_paket_type, 
  Visa_transaction, Visa_transaction_detail, Hotel_transaction, Hotel_transaction_detail, 
  Transport_transaction, Transport_transaction_detail, Passport_transaction, Passport_transaction_detail,
  Ticket_payment_history, Ticket_transaction, Item_fasilitas, Transaction_fasilitas, Transaction_fasilitas_detail, Fee_agen
} = require("../../../models");
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
    Dapatkan daftar akun by company and division
  */
  async list() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;
    try {
 
      var data = {};
      var paketPrice = {};

      // mengambil informasi paket berdasarkan id
      const q = await Paket.findAndCountAll({ 
        where : { 
          id : body.paket_id 
        }, 
        include: { 
          required : true, 
          model: Division, 
          where: { company_id: this.company_id}
        }
      });
      
      await Promise.all(
        await q.rows.map(async (e) => {
          data['name'] = e.name;
          data['status'] = e.tutup_paket;
        })
      );
      
      // mengambil informasi tipe paket dan harga dari masing-masing
      const q2 = await Paket_price.findAndCountAll({ 
        where : { 
          paket_id : body.paket_id 
        },
        include: [
          { 
            required : true, 
            model: Mst_paket_type, 
          }, 
          { 
            required : true, 
            model: Paket, 
            include: {
              required : true,
              model: Division,        
              where: { company_id: this.company_id}
            }
          }
        ] 
      });
      await Promise.all(
        await q2.rows.map(async (e) => {
          paketPrice = {...paketPrice,...{[e.mst_paket_type_id] : { name: e.Mst_paket_type.name, price: e.price, qt: 0, totalSell: 0 }}}
        })
      );

      // mengambil informasi total anggaran
      var listAgen = [];
      var TotalFeeAgen = 0;
      var total_anggaran = 0;
      const q3 = await Paket_transaction.findAndCountAll({ 
        where : { 
          paket_id : body.paket_id 
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
          if(!listAgen.includes(e.Fee_agen.agen_id)) {
            listAgen.push(e.Fee_agen.agen_id);
          }
          total_anggaran = total_anggaran + e.price;
          if( paketPrice[e.mst_paket_type_id] !== undefined) {
            paketPrice[e.mst_paket_type_id].qt = paketPrice[e.mst_paket_type_id].qt + 1;
            paketPrice[e.mst_paket_type_id].totalSell = paketPrice[e.mst_paket_type_id].totalSell + e.price;
          }
        })
      );
      
      // mengambil informasi total transaksi visa
      var unit_visa = 0;
      var total_rupiah_visa = 0;
      const q4 = await Visa_transaction.findAndCountAll({ 
        where: { paket_id: body.paket_id }, 
        include: {
          required : true, 
          model: Division,
          where: { company_id : this.company_id }
        }
     });
      await Promise.all(
        await q4.rows.map(async (e) => {
          unit_visa = unit_visa + e.pax;
          total_rupiah_visa = total_rupiah_visa + (e.pax * e.harga_costumer);
        })
      );

      // mengambil informasi total transaksi hotel
      var unit_hotel = 0;
      var total_rupiah_hotel = 0;
      const q5 = await Hotel_transaction.findAndCountAll({ 
        where: { paket_id: body.paket_id }, 
        include: {
          required : true, 
          model: Division,
          where: { company_id : this.company_id }
        }
      });
      await Promise.all(
        await q5.rows.map(async (e) => {
          unit_hotel = unit_hotel + 1;
          total_rupiah_hotel = total_rupiah_hotel + (e.jumlah_hari * e.jumlah_kamar * e.harga_kamar_per_hari);
        })
      );

      // mengambil informasi total transaksi Transport
      var unit_transport = 0;
      var total_rupiah_transport = 0;
      const q6 = await Transport_transaction_detail.findAndCountAll({ 
        include: {
          required : true, 
          model: Transport_transaction, 
          where: { paket_id: body.paket_id },
          include: {
            required : true, 
            model: Division, 
            where: { company_id: this.company_id  }
          }
        }
      });
      await Promise.all(
        await q6.rows.map(async (e) => {
          unit_transport = unit_transport + 1;
          total_rupiah_transport = total_rupiah_transport + e.price;
        })
      );

      // mengambil informasi total transaksi Passport
      var unit_passport = 0;
      var total_rupiah_passport = 0;
      const q7 = await Passport_transaction_detail.findAndCountAll({ 
        include: {
          required : true, 
          model: Passport_transaction, 
          where: { paket_id: body.paket_id},
          include: {
            required : true, 
            model: Division, 
            where: { company_id: this.company_id  }
          }
        }
      });
      await Promise.all(
        await q7.rows.map(async (e) => {
          unit_passport = unit_passport + 1;
          total_rupiah_passport = total_rupiah_passport + e.price;
        })
      );

      // mengambil informasi total transaksi Tiket
      var unit_tiket = 0;
      var total_rupiah_tiket = 0;
      var total_harga_tiket =  0;
      const q8 = await Ticket_transaction.findAndCountAll({ 
        where: { paket_id: body.paket_id, status: 'active' },
        include: {
          required : true, 
          model: Division, 
          where: { company_id: this.company_id  }
        }
      });
      await Promise.all(
        await q8.rows.map(async (e) => {
          unit_tiket = unit_tiket + e.pax;
          total_harga_tiket = total_harga_tiket + (e.pax * e.costumer_price );
        }) 
      );

      const q8_detail = await Ticket_payment_history.findAndCountAll({ 
        include: {
          required : true, 
          model: Ticket_transaction,
          where: { paket_id: body.paket_id, status: 'active' },
          include: {
            required : true, 
            model: Division, 
            where: { company_id: this.company_id  }
          }
        }
      });
      await Promise.all(
        await q8_detail.rows.map(async (e) => {
          total_rupiah_tiket = total_rupiah_tiket + parseInt(e.nominal);
        }) 
      );
      const total_rupiah_sisa_tiket = total_harga_tiket - total_rupiah_tiket
      
      var unit_fasilitas= 0;
      var total_rupiah_fasilitas = 0;
      const q9 = await Transaction_fasilitas_detail.findAndCountAll({ 
        include:[
          {
            required : true, 
            model: Transaction_fasilitas, 
            where: { paket_id: body.paket_id },
          },
          {
            required : true, 
            model: Item_fasilitas, 
          }
        ] 
      });

      await Promise.all(
        await q9.rows.map(async (e) => {
          unit_fasilitas = unit_fasilitas + 1;
          total_rupiah_fasilitas = total_rupiah_fasilitas + e.Item_fasilita.harga_jual;
        })
      );

      var total_aktualisasi = total_rupiah_fasilitas + total_rupiah_tiket + total_rupiah_visa + total_rupiah_hotel + total_rupiah_transport + total_rupiah_passport + TotalFeeAgen ;

      data['total_anggaran'] = total_anggaran;
      data['paketPrice'] = paketPrice
      data['belanja'] = total_aktualisasi;
      data['keuntungan'] = total_anggaran - total_aktualisasi;
      data['tiket'] = {
        unit: unit_tiket,
        total: total_rupiah_tiket,
        sisa: total_rupiah_sisa_tiket
      };

      data['fee_agen'] = {
        unit: listAgen.length, 
        total: TotalFeeAgen
      }

      data['fasilitas'] = {
        unit: unit_fasilitas,
        total: total_rupiah_fasilitas,
      };

      data['visa'] = {
        unit: unit_visa,
        total: total_rupiah_visa,
      };
      data['hotel'] = {
        unit: unit_hotel,
        total: total_rupiah_hotel,
      };
      data['transport'] = {
        unit: unit_transport,
        total: total_rupiah_transport,
      };
      data['passport'] = {
        unit: unit_passport,
        total: total_rupiah_passport,
      };
        
      data['total_aktualisasi'] = total_aktualisasi;

      return { data: data  };
    } catch (error) {
      console.log('------DD');
      console.log(error);
      console.log('------DD');
      return {};
    }
  }

}

module.exports = Model_r;
