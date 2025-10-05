const { Op, Amra_setting, Otp } = require("../../../models");
  
class Model_r {
    constructor(req) {
      this.req = req;
    }

    async countOtp(startOfDay) {
        const body = this.req.body;
        const otpCount = await Otp.count({
            where: {
            mobile_number: body.whatsappNumber,
            createdAt: { [Op.gte]: startOfDay },
            },
        });
        return otpCount;
    }

    async wapisender_api_device_key() {
      var data = {};
      await Amra_setting.findAll( { where : { name : { [Op.in] : ["wapisender_api_key", "wapisender_device_key"]} }}).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              data[e.name] = e.value;
            })
          );
      });
      return data;
    }
}

module.exports = Model_r;