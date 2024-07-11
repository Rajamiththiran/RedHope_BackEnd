"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable("staffs", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: "string",
      notNull: true,
    },
    phone_number: {
      type: "string",
      notNull: true,
      unique: true,
    },
    country_code: {
      type: "string",
      notNull: true,
    },
    id_number: {
      type: "string",
      notNull: true,
    },
    email: {
      type: "string",
      notNull: true,
      unique: true,
    },
    country: {
      type: "string",
      null: true,
    },
    address: {
      type: "text",
      null: true,
    },
    city: {
      type: "string",
      null: true,
    },
    zip: {
      type: "string",
      null: true,
    },
    marital_status: {
      type: "string",
      null: true,
    },
    gender: {
      type: "string",
      null: true,
    },
    date_of_birth: {
      type: "string",
      null: true,
    },
    nationality: {
      type: "string",
      null: true,
    },
    employee_id: {
      type: "string",
      notNull: true,
    },
    epf_number: {
      type: "string",
      null: true,
    },
    job_title: {
      type: "string",
      notNull: true,
    },
    department: {
      type: "string",
      null: true,
    },
    work_location: {
      type: "string",
      null: true,
    },
    employment_status: {
      type: "string",
      notNull: true,
    },
    work_hours: {
      type: "string",
      null: true,
    },
    work_shift: {
      type: "string",
      null: true,
    },
    supervisor_id: {
      type: "int",
      null: true,
      unsigned: true,
      foreignKey: {
        name: "staffs_staffs_id_foreign",
        table: "staffs",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
        mapping: "id",
      },
    },
    pay_type: {
      type: "string",
      notNull: true,
    },
    basic_salary: {
      type: "real",
      notNull: true,
    },
    overtime_rate: {
      type: "real",
      notNull: true,
    },
    no_pay_rate: {
      type: "real",
      notNull: true,
    },
    messaging_option: {
      type: "string",
      notNull: true,
    },
    bank_name: {
      type: "string",
      null: true,
    },
    bank_account_number: {
      type: "string",
      null: true,
    },
    branch_address: {
      type: "string",
      null: true,
    },
    account_holder_name: {
      type: "string",
      null: true,
    },
    profile_image_url: {
      type: "text",
      null: true,
    },
    joined_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    left_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    cv_url: {
      type: "text",
      null: true,
    },
    is_epf: {
      type: "boolean",
      defaultValue: false,
    },
    is_etf: {
      type: "boolean",
      defaultValue: false,
    },
    created_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    modified_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    deleted_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
  });
};

exports.down = function (db) {
  return db.dropTable("staffs");
};

exports._meta = {
  version: 1,
};
