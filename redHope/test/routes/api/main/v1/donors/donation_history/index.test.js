// File: C:\Users\Mithiran\Documents\RedHope_BackEnd\redHope\test\routes\api\main\v1\donors\donation_history\index.test.js

const t = require("tap");
const { build } = require("../../../../../../../helper");

t.test("POST /api/main/v1/donors/donation_history/create", async (t) => {
  const app = await build(t);

  const payload = {
    donor_id: 1,
    donation_date: "2023-08-01T00:00:00Z",
    address: "123 Main St",
    blood_type: "A+",
    volume: 450,
    donation_type: "Whole Blood",
    description: "Regular donation",
  };

  const res = await app.inject({
    method: "POST",
    url: "/api/main/v1/donors/donation_history/create",
    payload,
  });

  t.equal(res.statusCode, 201, "returns a status code of 201");
  const response = JSON.parse(res.payload);
  t.match(response, payload, "returns the created donation history");
  t.ok(response.id, "response includes an id");
});

t.test("GET /api/main/v1/donors/donation_history/donor/:donorId", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "GET",
    url: "/api/main/v1/donors/donation_history/donor/1",
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.ok(Array.isArray(response), "returns an array of donation history");
  t.ok(response.length > 0, "returns at least one donation history");
});

// Additional tests for other routes (GET /:id, GET /all, GET /byBloodType/:bloodType, PUT /:id, DELETE /:id) would go here
