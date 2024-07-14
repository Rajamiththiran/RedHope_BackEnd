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
      notNull: true,
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
      notNull: false,
    },
    phone_number: {
      type: "string",
      notNull: false,
    },
    country_code: {
      type: "string",
      notNull: true,
    },
    location: {
      type: "string",
      notNull: false,
    },
    donor_id: {
      type: "int",
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: "request_donor_fk",
        table: "donors",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        mapping: "id",
      },
    },
    hospital_id: {
      type: "int",
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: "request_hospital_fk",
        table: "hospitals",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        mapping: "id",
      },
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
