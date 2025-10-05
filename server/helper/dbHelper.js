const helper = {};

helper.dbList = async (value) => {
  var sqlTotal = {};
  if (value.hasOwnProperty("include")) {
    sqlTotal["include"] = value["include"];
  }
  if (value.hasOwnProperty("where")) {
    sqlTotal["where"] = value["where"];
  }
  return { total: sqlTotal, sql: value };
};

module.exports = helper;
