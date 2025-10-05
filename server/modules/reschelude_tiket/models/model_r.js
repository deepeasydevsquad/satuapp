const {
  Ticket_transaction,
  Ticket_payment_history,
  Ticket_transaction_detail,
  Mst_airline,
} = require("../../../models");

const {
  getCompanyIdByCode,
  getCabang,
} = require("../../../helper/companyHelper");

const moment = require("moment");
const { convertToRP } = require("../../../helper/currencyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.division_id = null;
    this.company_id = null;
    this.division = null;
  }

  async initialize() {
    if (!this.company_id) {
      this.company_id = await getCompanyIdByCode(this.req);
      this.division = await getCabang(this.req);
    }
  }

  async get_tiket() {
    await this.initialize();
    const { nomor_register } = this.req.body;

    if (!nomor_register) {
      throw new Error("Nomor register wajib diisi.");
    }

    try {
      const transaksi = await Ticket_transaction.findOne({
        where: {
          nomor_register: nomor_register,
        },
        attributes: ["id"],
        include: [
          {
            model: Ticket_transaction_detail,
            attributes: [
              "id",
              "pax",
              "code_booking",
              "departure_date",
              "travel_price",
              "costumer_price",
            ],
            include: [
              {
                model: Mst_airline,
                attributes: ["name"],
                as: "Mst_airline", // optional alias, sesuai relasi
              },
            ],
          },
          {
            model: Ticket_payment_history,
            attributes: ["nominal"],
          },
        ],
      });

      if (!transaksi) {
        throw new Error("Transaksi tidak ditemukan.");
      }

      const sudahBayar = transaksi.Ticket_payment_histories.reduce(
        (total, item) => total + Number(item.nominal || 0),
        0
      );

      const totalCostumerPrice = transaksi.Ticket_transaction_details.reduce(
        (total, item) => total + Number(item.costumer_price || 0),
        0
      );

      const sisaBayar = totalCostumerPrice - sudahBayar;

      return {
        id: transaksi.id,
        total_tagihan: totalCostumerPrice,
        sudah_bayar: sudahBayar,
        sisa_pembayaran: sisaBayar,
        details: transaksi.Ticket_transaction_details.map((d) => ({
          id: d.id,
          pax: d.pax,
          code_booking: d.code_booking,
          departure_date: d.departure_date,
          travel_price: d.travel_price,
          costumer_price: d.costumer_price,
          airline: d.Mst_airline?.name ?? null,
        })),
        payment_history: transaksi.Ticket_payment_histories,
      };
    } catch (error) {
      console.error("❌ Error get_tiket:", error);
      throw error;
    }
  }
}

module.exports = Model_r;
