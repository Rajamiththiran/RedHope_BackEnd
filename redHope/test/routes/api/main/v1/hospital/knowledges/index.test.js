// File: C:\Users\Mithiran\Documents\RedHope_BackEnd\redHope\test\routes\api\main\v1\hospital\knowledges\index.test.js

const t = require("tap");
const { build } = require("../../../../../../../helper");

t.test("POST /api/main/v1/hospital/knowledges/create", async (t) => {
  const app = await build(t);

  const payload = {
    hospital_id: 1,
    knowledge: "Regular blood donation is safe for healthy adults.",
  };

  const res = await app.inject({
    method: "POST",
    url: "/api/main/v1/hospital/knowledges/create",
    payload,
  });

  t.equal(res.statusCode, 201, "returns a status code of 201");
  const response = JSON.parse(res.payload);
  t.match(response, payload, "returns the created knowledge");
  t.ok(response.id, "response includes an id");
});

t.test("GET /api/main/v1/hospital/knowledges/all", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "GET",
    url: "/api/main/v1/hospital/knowledges/all",
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.ok(Array.isArray(response), "returns an array of knowledges");
});

// Additional tests for other routes (GET /:id, PUT /:id, DELETE /:id, GET /browse/:hospitalId) would go here
