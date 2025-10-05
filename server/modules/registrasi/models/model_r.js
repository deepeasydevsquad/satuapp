const { Company, Amra_setting, Otp } = require("../../../models");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  async getAmraSetting() {
    try {
      var data = {};
      await Amra_setting.findOne({
        attributes: ["value"],
        where: { name: "harga_langganan" },
      }).then(async (e) => {
        if (e) {
          data["harga_langganan"] = e.value;
        }
      });
      return { data };
    } catch (error) {
      return {};
    }
  }

  async generated_company_code() {
    let companyCode;
    do {
      companyCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    } while (await Company.findOne({ where: { code: companyCode } }));

    return companyCode;
  }

  async randomString(length, chars) {
    var result = "";
    for (var i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }

  async generated_company_refresh_token() {
    var refreshToken = "";
    let condition = true;
    while (condition) {
      refreshToken = await this.randomString(
        49,
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      );
      var check = await Company.findOne({
        where: { refresh_token: refreshToken },
      });
      if (!check) condition = false;
    }
    return refreshToken;
  }

  async get_price() {
    const settings = await Amra_setting.findOne({
      attributes: ["value"],
      where: { name: "harga_langganan" },
    });

    return settings ? parseInt(settings.value, 10) : 0;
  }

  async get_otp(i) {
    try {
      const dat = {
        where: {
          mobile_number: i.whatsapp_company_number,
          otp_code: i.token,
          otp_status: "active",
          otp_type: "registration",
        },
      }
      const otpRecord = await Otp.findOne(dat);
      return otpRecord;
    } catch (error) {
      return {}
    }
   
  }

  async get_url_sand_box() {
    const settings = await Amra_setting.findOne({
      attributes: ["value"],
      where: { name: "MIDTRANS_GET_STATUS_URL" },
    });

    return settings ? settings.value : '';
  }
}

module.exports = Model_r;
