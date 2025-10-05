const { Op, Company } = require("../models");
const { validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const validation = {};

validation.check_nomor_whatsapp = async (value, { req }) => {
  try {
    const q = await Company.findOne({
      where: { whatsapp_company_number: value },
    });
    if (q) {
      throw new Error("Nomor whatsapp sudah terdaftar dipangkalan data.");
    }
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_nomor_whatsapp_update = async (value, { req }) => {
  const id = req.body.id;
  try {
    const q = await Company.findOne({
      where: { whatsapp_company_number: value, id: { [Op.ne]: id } },
    });
    if (q) {
      throw new Error("Nomor whatsapp sudah terdaftar dipangkalan data.");
    }
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_email = async (value, { req }) => {
  try {
    const q = await Company.findOne({
      where: { email: value },
    });
    if (q) {
      throw new Error("Email sudah terdaftar dipangkalan data.");
    }
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_email_update = async (value, { req }) => {
  const id = req.body.id;
  try {
    const q = await Company.findOne({
      where: { email: value, id: { [Op.ne]: id } },
    });
    if (q) {
      throw new Error("Email sudah terdaftar dipangkalan data.");
    }
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_username = async (value, { req }) => {
  try {
    const q = await Company.findOne({
      where: { username: value },
    });
    if (q) {
      throw new Error("Username sudah terdaftar dipangkalan data.");
    }
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_username_update = async (value, { req }) => {
  const id = req.body.id;
  try {
    const q = await Company.findOne({
      where: { username: value, id: { [Op.ne]: id } },
    });
    if (q) {
      throw new Error("Username sudah terdaftar dipangkalan data.");
    }
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_id = async (value, { req }) => {
  try {
    const q = await Company.findOne({
      where: { id: value },
    });
    if (!q) {
      throw new Error("ID perusahaan tidak terdaftar dipangkalan data.");
    }
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = validation;
