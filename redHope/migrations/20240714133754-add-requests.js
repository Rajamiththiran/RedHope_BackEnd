exports.up = function (db) {
  return db.createTable("requests", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    requester_name: {
      type: "string",
      notNull: true,
    },
    requester_email: {
      type: "string",
      notNull: true,
    },
    blood_type_requested: {
      type: "string",
      notNull: true,
    },
    urgency_level: {
      type: "string",
      null: true,
    },
    request_date: {
      type: "timestamp",
      timezone: true,
      notNull: true,
      defaultValue: new String("CURRENT_TIMESTAMP"),
    },
    status: {
      type: "string",
      notNull: true,
      defaultValue: "pending",
    },
    description: {
      type: "text",
      null: true,
    },
    phone_number: {
      type: "string",
      notNull: true,
    },
    country_code: {
      type: "string",
      notNull: true,
    },
    location: {
      type: "string",
      notNull: true,
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
  return db.dropTable("requests");
};
