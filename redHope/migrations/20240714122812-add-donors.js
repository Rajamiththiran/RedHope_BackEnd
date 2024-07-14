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
  return db.createTable("donors", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: "string",
      notNull: true,
    },
    email: {
      type: "string",
      notNull: true,
      unique: true,
    },
    password: {
      type: "string",
      notNull: true,
    },
    address: {
      type: "text",
      notNull: true,
    },
    phone_number: {
      type: "string",
      notNull: true,
    },
    blood_type: {
      type: "string",
      notNull: true,
    },
    donation_history: {
      type: "text",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      timezone: true,
      notNull: true,
      defaultValue: new String("CURRENT_TIMESTAMP"),
    },
    modified_at: {
      type: "timestamp",
      timezone: true,
      notNull: true,
      defaultValue: new String("CURRENT_TIMESTAMP"),
    },
    deleted_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
  });
};

exports.down = function (db) {
  return db.dropTable("donors");
};

exports._meta = {
  version: 1,
};
