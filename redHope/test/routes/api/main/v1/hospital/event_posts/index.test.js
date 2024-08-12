// File: C:\Users\Mithiran\Documents\RedHope_BackEnd\redHope\test\routes\api\main\v1\hospital\event_posts\index.test.js

const t = require("tap");
const { build } = require("../../../../../../../helper");

t.test("POST /api/main/v1/hospital/event_posts/create", async (t) => {
  const app = await build(t);

  const payload = {
    hospital_id: 1,
    title: "Blood Drive at City Hospital",
    start_time: "2023-09-01T09:00:00Z",
    end_time: "2023-09-01T17:00:00Z",
    hospital_name: "City Hospital",
    location: "789 Hospital Road",
    description: "Join us for our monthly blood drive",
  };

  const res = await app.inject({
    method: "POST",
    url: "/api/main/v1/hospital/event_posts/create",
    payload,
  });

  t.equal(res.statusCode, 201, "returns a status code of 201");
  const response = JSON.parse(res.payload);
  t.match(response, payload, "returns the created event post");
  t.ok(response.id, "response includes an id");
});

t.test("GET /api/main/v1/hospital/event_posts/all", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "GET",
    url: "/api/main/v1/hospital/event_posts/all",
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.ok(Array.isArray(response), "returns an array of event posts");
});

// Additional tests for other routes (GET /:id, PUT /:id, DELETE /:id, GET /browse/:hospitalId) would go here
