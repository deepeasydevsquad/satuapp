const { sequelize, Fasilitas_paket_la, Detail_fasilitas_paket_la, Paket_la } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");

const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.paket_la_id;
    this.fasilitas_paket_la_id;
  }

  async initialize() {
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async generateInvoiceNumber() {
    // generate nomor invoice unik serta tidak sama dengan yang sudah ada
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    while (true) {
      const invoiceNumber = Array.from({ length: 6 }, () =>
        possible.charAt(Math.floor(Math.random() * possible.length))
      ).join("");
  
      const sama = await Fasilitas_paket_la.findOne({ where: { invoice: invoiceNumber } });
      if (!sama) return invoiceNumber;
    }
  }

  async add(total_price) {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const invoice = await this.generateInvoiceNumber();
    const body = this.req.body;
    
    try {
        console.debug('Initializing addition of new fasilitas');
        
        const fasilitas = await Fasilitas_paket_la.create(
          {
              paket_la_id: body.paketlaId,
              invoice: invoice,
              total: 0,
              createdAt: myDate,
              updatedAt: myDate,
          },
          { transaction: this.t }
        );
        
        console.debug('Fasilitas created:', fasilitas);
        
        const fasilitasId = fasilitas.id;
        let totalPrice = 0;
        const items = body.items || [];
        
        for (const item of items) {
            console.debug('Adding detail:', item);
            
            await Detail_fasilitas_paket_la.create(
              {
                fasilitas_paket_la_id: fasilitasId,
                description: item.description,
                check_in: item.check_in,
                check_out: item.check_out,
                day: item.day,
                pax: item.pax,
                price: item.price,
                createdAt: myDate,
                updatedAt: myDate,
              },
              { transaction: this.t }
            );
            
            totalPrice += parseFloat(item.price || 0);
        }
        
        console.debug('Updating total price:', totalPrice);
        
        await Fasilitas_paket_la.update(
            { total: totalPrice, updatedAt: myDate },
            { where: { id: fasilitasId }, transaction: this.t }
        );

        await Paket_la.update(
          { total_price: totalPrice + total_price, updatedAt: myDate },
          { where: { id: body.paketlaId }, transaction: this.t }
        );
        
        this.message = `Berhasil menambahkan fasilitas dengan Invoice: ${invoice}, ID: ${fasilitasId}, dan ${items.length} item detail.`;
        console.debug(this.message);
    } catch (error) {
        console.error('Error during addition:', error);
        this.state = false;
    }
  }

  async delete(total_price) {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const model_r = new Model_r(this.req);
      // get info fasilitas paket la
      const infoFasilitasPaketLA = await model_r.infoFasilitasPaketLA(body.fasilitaspaketlaId);
      const deleted = await Detail_fasilitas_paket_la.destroy({
          where: {
            id: body.itemId,
          },
          transaction: this.t,
      });

      if (!deleted) {
        throw new Error(`Item dengan ID ${body.itemId} tidak ditemukan atau sudah dihapus.`);
      }

      // Cek apakah masih ada item tersisa
      const remainingItems = await Detail_fasilitas_paket_la.count({
        where: { fasilitas_paket_la_id: body.fasilitaspaketlaId },
        transaction: this.t,
      }); 

      // Jika tidak ada item tersisa, hapus fasilitas paket (Invoice paket la)
      if (remainingItems === 0) {
        await Fasilitas_paket_la.destroy({
          where: { id: body.fasilitaspaketlaId },
          transaction: this.t 
        });
          this.message = `Menghapus seluruh fasilitas paket LA dengan Nomor Invoice: ${infoFasilitasPaketLA.invoice}, ID Fasilitas Paket LA: ${body.fasilitaspaketlaId}, dan ID paket la: ${infoFasilitasPaketLA.paket_la_id}.`;
      } else {
          this.message = `Menghapus item fasilitas paket LA dengan Nomor Invoice: ${infoFasilitasPaketLA.invoice}, ID Fasilitas Paket LA: ${body.fasilitaspaketlaId}, dan ID: ${body.itemId}.`;
        }

      // Jika masih ada Item, Hitung total harga dari detail fasilitas paket
      const totalPrice = (await Detail_fasilitas_paket_la.sum("price", {
        where: { fasilitas_paket_la_id: body.fasilitaspaketlaId },
        transaction: this.t,
      })) || 0;

      // Update total harga fasilitas paket
      await Fasilitas_paket_la.update(
        { total: totalPrice },
        { where: { id: body.fasilitaspaketlaId }, transaction: this.t }
      );

      // // Jika ada data fasilitas Item, Hitung total harga dari Fasilitas Paket LA
      // const totalPrice_paketla = (await Fasilitas_paket_la.sum("total", {
      //   where: { paket_la_id: infoFasilitasPaketLA.paket_la_id},
      //   transaction: this.t,
      // })) || 0;

      // Update total harga paket la
      await Paket_la.update(
        { total_price: totalPrice - total_price, updatedAt: myDate },
        { where: { id: infoFasilitasPaketLA.paket_la_id }, transaction: this.t }
      );

    } catch (error) {
        console.error("Error saat menghapus item fasilitas paket LA:", error);
        this.state = false;
        this.message = error.message;
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
