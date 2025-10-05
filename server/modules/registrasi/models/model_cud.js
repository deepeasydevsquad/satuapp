const bcrypt = require("bcryptjs");
const moment = require("moment");
const { sequelize, Company, Subscribtion_payment_history } = require("../../../models");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.t;
    this.state;
  }

  async initialize() {
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async create_company(i) {
    // initialize general property
    await this.initialize();
    // define date
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    // insert process
    try {
      // insert new company
      const iC = await Company.create({
          code: i.company_code,
          kurs: "rp",
          logo: "",
          icon: "",
          company_name : i.company_name,
          email: i.email,
          type: "limited",
          verify_status: "unverified",
          verify_time: null,
          whatsapp_company_number : i.whatsapp_company_number,
          otp: i.otp_code,
          otp_expired_time: i.expired_time,
          invoice_logo: null,
          invoice_title: null,
          start_subscribtion: myDate,
          end_subscribtion: i.end_subscription,
          whatsapp_device_number: null,
          whatsapp_device_key: null,
          refresh_token: i.refresh_token,
          saldo: 0,
          markup_ppob: 0,
          username: i.username,
          password: i.hash_password,
          createdAt: myDate,
          updatedAt: myDate,
      },
      {
        transaction: this.t,
      });
      // insert subscribtion_payment_history
      await Subscribtion_payment_history.create({
        company_id: iC.id,
        order_id : i.order_id,
        amount: i.price,
        status: "process",    
        createdAt: myDate,
        updatedAt: myDate,
      },
      {
        transaction: this.t,
      });

    } catch (error) {
      this.state = false;
    }
  }

  async response() {
    if (this.state) {
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
