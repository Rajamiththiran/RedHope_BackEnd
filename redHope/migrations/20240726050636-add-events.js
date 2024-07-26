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
  return db.createTable("events", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    donor_id: {
      type: "int",
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: "events_donor_id_fk",
        table: "donors",
        mapping: "id",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
      },
    },
    title: {
      type: "string",
      notNull: true,
    },
    start_time: {
      type: "date",
      notNull: true,
    },
    start_time: {
      type: "date",
      notNull: true,
    },
    address: {
      type: "text",
      notNull: true,
    },
    color: {
      type: "string",
      null: true,
    },
    reminder: {
      type: "date",
      null: true,
    },
    description: {
      type: "text",
      null: true,
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
  return db.dropTable("events");
};

exports._meta = {
  version: 1,
};
