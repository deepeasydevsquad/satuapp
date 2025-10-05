const { Ticket_transaction, Ticket_payment_history, Ticket_transaction_detail, Mst_airline } = require("../../../models");
const { getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const { convertToRP } = require("../../../helper/currencyHelper");
const moment = require("moment");

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

  async getRefundTicketDetail() {
    await this.initialize();
    const { nomor_register } = this.req.body;

    try {
      const data = await Ticket_transaction.findOne({
        where: { nomor_register },
        attributes: ["id", "nomor_register", "total_transaksi"],
        include: [
          {
            model: Ticket_transaction_detail,
            attributes: [
              "pax",
              "code_booking",
              "departure_date",
              "travel_price",
              "costumer_price",
            ],
            include: {
              model: Mst_airline,
              attributes: ["name"],
            },
          },
          {
            model: Ticket_payment_history,
            attributes: [
              "invoice",
              "nominal",
              "petugas",
              "status",
              "createdAt",
            ],
          },
        ],
      });

      if (!data) return null;

      const totalBayar = data.Ticket_payment_histories.reduce((acc, curr) => {
        return acc + (curr.nominal || 0);
      }, 0);

      const details = await Promise.all(
        data.Ticket_transaction_details.map(async (d) => {
          const pax = d.pax || 1;
          const travelPrice = d.travel_price || 0;
          const costumerPrice = d.costumer_price || 0;

          const totalTravel = travelPrice * pax;
          const totalCostumer = costumerPrice * pax;
          const fee = totalCostumer - totalTravel;
          const sisaTagihan = totalCostumer - totalBayar;

          return {
            pax,
            code_booking: d.code_booking,
            maskapai: d.Mst_airline?.name || "-",
            tanggal_berangkat: moment(d.departure_date).format("YYYY-MM-DD"),
            harga_travel: await convertToRP(totalTravel),
            harga_costumer: await convertToRP(totalCostumer),
            total_harga_tiket: await convertToRP(totalCostumer),
            total_fee_tiket: await convertToRP(fee),
            sisa_tagihan: await convertToRP(sisaTagihan < 0 ? 0 : sisaTagihan),
          };
        })
      );

      return {
        nomor_register: data.nomor_register,
        total_transaksi: await convertToRP(data.total_transaksi),
        total_dibayar: await convertToRP(totalBayar),
        detail: details,
      };
    } catch (error) {
      console.error(
        "Error di Model_r saat mengambil getRefundTicketDetail:",
        error
      );
      throw error;
    }
  }
}

module.exports = Model_r;
