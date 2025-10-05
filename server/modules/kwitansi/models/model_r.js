const axios = require("axios");

const {
  Company,
  Subscribtion_payment_history,
  Amra_setting,
  Otp,
  sequelize,
} = require("../../../models");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

sequelize
  .authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

class Model_r {
  constructor(req) {
    this.req = req;
  }

  async getUrl() {
    const url = await Amra_setting.findOne({
      where: { name: "MIDTRANS_GET_STATUS_URL" }, // ✅ Fix typo
    });
    return url ? url.value : null; // ✅ Ambil value dari DB
  }

  async getPrice() {
    const HargaLangganan = await Amra_setting.findOne({
      where: { name: "harga_langganan" },
    });
    return HargaLangganan ? parseInt(HargaLangganan.value, 10) : 0;
  }

  async getRekening() {
    const NamaRekening = await Amra_setting.findOne({
      where: { name: "nama_rekening" },
    });
    return NamaRekening ? NamaRekening.value : "Tidak tersedia";
  }

  async getOrderid() {
    const payment = await Subscribtion_payment_history.findOne({
      order: [["createdAt", "DESC"]],
      attributes: ["order_id", "status", "createdAt"],
    });

    if (!payment) {
      throw new Error("❌ Tidak ada data pembayaran ditemukan");
    }

    return payment;
  }

  async getMidtrans() {
    const payment = await Subscribtion_payment_history.findOne({
      order: [["createdAt", "DESC"]],
      attributes: ["order_id"],
    });

    if (!payment) {
      throw new Error("❌ Tidak ada pembayaran ditemukan");
    }

    const order_id = payment.order_id;
    console.log("📝 Order ID:", order_id);

    // ✅ Ambil URL dari getUrl()
    const midtransUrl = await this.getUrl();
    if (!midtransUrl) {
      throw new Error("❌ URL Midtrans tidak ditemukan");
    }

    const midtransResponse = await axios.get(
      `${midtransUrl}/${order_id}/status`, // ✅ Fix penggunaan URL
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.MIDTRANS_SERVER_KEY + ":"
          ).toString("base64")}`,
        },
      }
    );

    console.log("🔍 Midtrans Full Response:", midtransResponse.data);

    const va_numbers = midtransResponse.data.va_numbers || [];
    const bank =
      va_numbers.length > 0
        ? va_numbers[0].bank.toUpperCase()
        : "Tidak tersedia";
    const va_number =
      va_numbers.length > 0 ? va_numbers[0].va_number : "Tidak tersedia";

    return {
      order_id: midtransResponse.data.order_id,
      price: parseInt(midtransResponse.data.gross_amount, 10),
      rekening:
        bank !== "Tidak tersedia" ? `${bank} - ${va_number}` : "Tidak tersedia",
      bank: bank,
      va_number: va_number,
      status: midtransResponse.data.transaction_status,
    };
  }
}

module.exports = Model_r;
