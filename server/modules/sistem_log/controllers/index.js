const Model_r = require("../models/model_r"); // Impor class Model_r
const { handleServerError } = require("../../../helper/handleError");

exports.get_sistem_log = async (req, res) => {
  try {
    const model = new Model_r(req); // Buat instance dari Model_r
    const logs = await model.list(); // Panggil method getTravelLogs

    res.status(200).json({
      error: false,
      data: logs.data, // Data log yang sudah diformat
      total: logs.total, // Jumlah total log
    });
  } catch (error) {
    console.log("--------------xxxx");
      console.log(error);
      console.log("--------------xxxx");
    handleServerError(res, error.message); // Handle error
  }
};
