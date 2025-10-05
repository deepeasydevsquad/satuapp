const moment = require("moment");

const { User } = require("../../db/models");
const { jwt_value } = require("../../helpers/jwt");

const helper = {};

helper.info_user = async (req) => {
  const jwt = await jwt_value(req);
  var list = {};
  await User.findOne({
    where: { kode: jwt.kode },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["name"] = val.name;
    }
  });
  return list;
};

module.exports = helper;
