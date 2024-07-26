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
  return db.createTable("event_posts", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    hospital_id: {
      type: "int",
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: "event_posts_hospital_id_fk",
        table: "hospitals",
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
      type: "timestamp",
      notNull: true,
    },
    end_time: {
      type: "timestamp",
      notNull: true,
    },
    location: {
      type: "string",
      notNull: true,
    },
    description: {
      type: "text",
      null: true,
    },
    image_url: {
      type: "string",
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
  return db.dropTable("event_posts");
};

exports._meta = {
  version: 1,
};
