const { sequelize, Company } = require("../../../models");
const { validationResult } = require("express-validator");
const moment = require("moment");

class Model_cud {
  constructor(req, companyId) {
    this.req = req;
    this.companyId = companyId; // ⬅️ Ambil dari controller, bukan dari req.user
    this.transaction = null;
  }

  async initialize() {
    this.transaction = await sequelize.transaction();
    this.state = true;
  }

  async update() {
    await this.initialize();
    const errors = validationResult(this.req);
    if (!errors.isEmpty()) {
      this.state = false;
      this.errors = errors.array();
      return;
    }

    if (!this.companyId) {
      // ⬅️ Gunakan this.companyId yang di-passing dari controller
      this.state = false;
      this.error = "Unauthorized: Missing companyId";
      return;
    }

    const {
      company_name,
      email,
      whatsapp_company_number,
      invoice_title,
      currency,
    } = this.req.body;
    let updateData = {
      company_name,
      email,
      whatsapp_company_number,
      invoice_title,
      currency,
    };

    //cek data yang di kirim di body
    console.log("Received body:", this.req.body);
    // Debugging: Cek apakah file diterima
    console.log("Received Files:", this.req.files);

    if (this.req.files) {
      if (this.req.files.logo) {
        updateData.logo = this.req.files.logo[0]?.filename;
      }
      if (this.req.files.icon) {
        updateData.icon = this.req.files.icon[0]?.filename;
      }
      if (this.req.files.invoice_logo) {
        updateData.invoice_logo = this.req.files.invoice_logo[0]?.filename;
      }
    }

    try {
      await Company.update(updateData, {
        where: { id: this.companyId }, // ⬅️ Gunakan companyId yang valid
        transaction: this.transaction,
      });

      this.message = "Company settings updated successfully";
    } catch (error) {
      if (this.transaction) await this.transaction.rollback();
      this.state = false;
      this.error = error.message;
    }
  }

  async response(res) {
    if (this.state) {
      if (this.transaction) await this.transaction.commit();
      return res.json({ message: this.message });
    } else {
      if (this.transaction) await this.transaction.rollback();
      return res
        .status(400)
        .json({ errors: this.errors || [{ msg: this.error }] });
    }
  }
}

module.exports = Model_cud;
