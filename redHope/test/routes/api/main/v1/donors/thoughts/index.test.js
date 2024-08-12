// File: C:\Users\Mithiran\Documents\RedHope_BackEnd\redHope\test\routes\api\main\v1\donors\thoughts\index.test.js

const t = require("tap");
const { build } = require("../../../../../../../helper");

t.test("POST /api/main/v1/donors/thoughts/create", async (t) => {
  const app = await build(t);

  const payload = {
    donor_id: 1,
    title: "My Donation Experience",
    thought: "It was a fulfilling experience to donate blood today.",
  };

  const res = await app.inject({
    method: "POST",
    url: "/api/main/v1/donors/thoughts/create",
    payload,
  });

  t.equal(res.statusCode, 201, "returns a status code of 201");
  const response = JSON.parse(res.payload);
  t.match(response, payload, "returns the created thought");
  t.ok(response.id, "response includes an id");
});

t.test("GET /api/main/v1/donors/thoughts/all", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "GET",
    url: "/api/main/v1/donors/thoughts/all",
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.ok(Array.isArray(response), "returns an array of thoughts");
});

// Additional tests for other routes (GET /:id, PUT /:id, DELETE /:id, GET /browse/:donorId) would go here
