"use strict";
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Model_cud = require("../models/model_cud");
const Model_r = require("../models/model_r");
const { handleServerError } = require("../../../helper/handleError");

/**
 * Mengambil data kwitansi pembayaran
 */
exports.getKwitansi = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const price = await model_r.getPrice();
    const rekening = await model_r.getRekening();
    const order_id = await model_r.getOrderid();
    const midtrans = await model_r.getMidtrans();
    console.log("Mengembalikan response dengan rekening:", rekening);

    return res.status(200).json({
      order_id: order_id.order_id,
      price: price,
      rekening: rekening, // ✅ Fix: gunakan rekening.value
      bank: midtrans.bank, // ✅ Fix: ambil dari midtrans response
      va_number: midtrans.va_number, // ✅ Fix: ambil dari midtrans response
      status: order_id.status,
      createdAt: order_id.createdAt,
    });
  } catch (error) {
    console.error("❌ Error fetching receipt:", error);
    handleServerError(res);
    return res
      .status(500)
      .json({ error: true, error_msg: "Terjadi kesalahan server" });
  }
};

/**
 * Memeriksa status pembayaran dari Midtrans setiap 5 detik
 */
exports.checkMidtransStatus = async () => {
  try {
    const model_r = new Model_r();
    const payment = await model_r.getOrderid(); // Ambil order_id terbaru

    if (!payment || !payment.order_id) {
      console.error("❌ Tidak ada data pembayaran yang ditemukan");
      return;
    }

    const midtransData = await model_r.getMidtrans(); // Ambil status dari Midtrans

    if (!midtransData || !midtransData.status) {
      console.error("❌ Data Midtrans tidak valid");
      return;
    }

    console.log("🔍 Status Midtrans:", midtransData.status);

    if (midtransData.status === "settlement") {
      console.log("✅ Pembayaran berhasil! Order ID:", midtransData.order_id);
      // Jalankan fungsi update status pembayaran
      await exports.updatePaymentStatus(
        midtransData.order_id,
        midtransData.status
      );
    } else {
      console.log("⚠️ Menunggu pembayaran... Order ID:", midtransData.order_id);
    }
  } catch (error) {
    console.error("❌ Error saat memeriksa status Midtrans:", error.message);
  }
};

/**
 * Memperbarui status pembayaran berdasarkan order ID dan status Midtrans
 */
exports.updatePaymentStatus = async (order_id, midtransStatus) => {
  try {
    if (!order_id) {
      console.error("❌ Order ID tidak valid!");
      return { success: false, message: "Order ID tidak valid" };
    }

    const model_cud = new Model_cud();

    console.log("🔄 Memproses update status pembayaran...");
    console.log("🔍 Order ID:", order_id);
    console.log("📝 Status dari Midtrans:", midtransStatus);

    if (midtransStatus === "settlement") {
      // Jika status Settlement, update status pembayaran ke "accept"
      const result = await model_cud.updateStatusPayment({
        order_id,
        status: "accept",
      });

      if (result) {
        console.log("✅ Status pembayaran berhasil diperbarui!");
        return { success: true, status: "accept" };
      } else {
        console.error("❌ Gagal memperbarui status pembayaran!");
        return {
          success: false,
          message: "Gagal memperbarui status pembayaran",
        };
      }
    } else {
      // Jika status bukan Settlement, buat notifikasi
      const message = `⚠️ Pembayaran belum selesai untuk Order ID: ${order_id}. Segera lakukan pembayaran!`;
      console.warn(message);

      // Simpan notifikasi ke database jika diperlukan
      /*
      await Notification.create({
        order_id: order_id,
        message: message,
        status: "pending",
      });
      */

      return { success: false, status: midtransStatus, message: message };
    }
  } catch (error) {
    console.error("❌ Error saat memperbarui status pembayaran:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
};
