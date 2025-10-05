const moment = require("moment");
const { sequelize, Otp } = require("../../../models");

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

  async savedOtp(i) {
    // initialize general property
    await this.initialize();
    // insert process
    try {
      
      // inactive where mobile number
      await Otp.update(
        { otp_status: "inactive" },
        {
          where: {
            mobile_number: i.mobile_number,
            otp_status: "active",
            // expired_time: { [Op.gt]: new Date() }, // Masih berlaku
          },
        },
        {
          transaction: this.t,
        }
      );

      const myNextDate = moment(new Date()).add(1, 'days').format("YYYY-MM-DD HH:mm:ss");

      // insert to database new oTP
      await Otp.create({
        otp_code: i.otp_code,
        expired_time: myNextDate,
        mobile_number: i.mobile_number,
        otp_type: "registration",
        otp_status: "active",
        user_type: "amra",
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