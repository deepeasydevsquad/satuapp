const axios = require("axios");

const {
  Company,
  Subscribtion_payment_history,
  Amra_setting,
  Otp,
  sequelize,
} = require("../../../models");
const Model_r = require("./model_r");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.t = null;
    this.state = true;
  }

  async initialize() {
    try {
      this.t = await sequelize.transaction();
    } catch (error) {
      console.error("❌ Error saat inisialisasi transaksi:", error);
      this.state = false;
    }
  }

  async updateStatusPayment({ order_id, status }) {
    try {
      console.log("🔍 Mencari pembayaran dengan order_id:", order_id); // Debugging

      const payment = await Subscribtion_payment_history.findOne({
        where: { order_id },
      });

      if (!payment) {
        console.error(
          "❌ Data pembayaran tidak ditemukan untuk order_id:",
          order_id
        );
        return null;
      }

      console.log("✅ Data ditemukan, mengupdate status ke:", status);

      await payment.update({ status });

      console.log("✅ Status pembayaran berhasil diperbarui:", {
        order_id,
        status,
      });

      return payment;
    } catch (error) {
      console.error("❌ Error saat mengupdate status pembayaran:", error);
      throw error;
    }
  }
}

module.exports = Model_cud;
