"use strict";

const { Company, Member, User, sequelize } = require("../../../models");
const bcrypt = require("bcryptjs");

class model_cud {
  constructor(req) {
    this.req = req;
    this.company_id = null;
  }

  async updateProfile(data) {
    const { type: role, id: memberId } = this.req.user;
    const companyId =
      await require("../../../helper/companyHelper").getCompanyIdByCode(
        this.req
      );

    const t = await sequelize.transaction();

    try {
      if (role === "administrator") {
        const { company_name, username, email, whatsapp_company_number } = data;
        const updateData = {
          company_name,
          username,
          email,
          whatsapp_company_number,
        };

        Object.keys(updateData).forEach(
          (key) => updateData[key] === undefined && delete updateData[key]
        );

        await Company.update(updateData, {
          where: { id: companyId },
          transaction: t,
        });

        await t.commit();
        return { message: "Profil perusahaan berhasil diperbarui." };
      }

      if (role === "staff") {
        const { fullname, email, whatsapp_number, username } = data;
        const memberUpdateData = { fullname, email, whatsapp_number };
        Object.keys(memberUpdateData).forEach(
          (key) =>
            memberUpdateData[key] === undefined && delete memberUpdateData[key]
        );
        if (Object.keys(memberUpdateData).length > 0) {
          await Member.update(memberUpdateData, {
            where: { id: memberId },
            transaction: t,
          });
        }
        await t.commit();
        return { message: "Profil staff berhasil diperbarui." };
      }

      throw new Error("Peran tidak diizinkan untuk melakukan pembaruan.");
    } catch (error) {
      await t.rollback();
      console.error("Error in model_cud.updateProfile: ", error);
      throw error;
    }
  }

  async changePassword({ currentPassword, newPassword }) {
    const { type: role, id: memberId } = this.req.user;
    let memberAccount;

    try {
      if (role === "administrator") {
        const { username } = this.req.user;
        memberAccount = await Company.findOne({
          where: { username: username },
        });
      } else if (role === "staff") {
        console.log("Searching for staff account in Member table...");
        memberAccount = await Member.findOne({ where: { id: memberId } });
        console.log(
          "Staff account in Member table found:",
          memberAccount ? "Yes" : "No"
        );
      } else {
        const error = new Error("Peran tidak valid untuk mengubah password.");
        error.statusCode = 400;
        throw error;
      }
    } catch (dbError) {
      console.error("Database error when finding user:", dbError);
      if (dbError.statusCode) throw dbError;
      const error = new Error("Gagal mencari akun pengguna.");
      error.statusCode = 500;
      throw error;
    }

    if (!memberAccount) {
      console.error("User account not found");
      const error = new Error("Akun member tidak ditemukan.");
      error.statusCode = 404;
      throw error;
    }

    try {
      if (!currentPassword || !memberAccount.password) {
        const error = new Error("Data password tidak lengkap.");
        error.statusCode = 400;
        throw error;
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        memberAccount.password
      );

      if (!isMatch) {
        console.error("Password verification failed");
        const error = new Error("Password saat ini yang Anda masukkan salah.");
        error.statusCode = 400;
        throw error;
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 10);

      const t = await sequelize.transaction();

      try {
        if (role === "administrator") {
          await Company.update(
            { password: newHashedPassword },
            { where: { id: memberAccount.id }, transaction: t }
          );
        } else if (role === "staff") {
          await Member.update(
            { password: newHashedPassword },
            { where: { id: memberAccount.id }, transaction: t }
          );
        }

        await t.commit();
        return { message: "Password berhasil diperbarui." };
      } catch (updateError) {
        await t.rollback();
        console.error("Error updating password:", updateError);
        const error = new Error("Gagal menyimpan password baru.");
        error.statusCode = 500;
        throw error;
      }
    } catch (operationError) {
      console.error("Bcrypt/Password operation error:", operationError);
      if (operationError.statusCode) throw operationError;
      const error = new Error(
        "Gagal memverifikasi atau mengenkripsi password."
      );
      error.statusCode = 500;
      throw error;
    }
  }
}

module.exports = model_cud;
