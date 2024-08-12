// File: C:\Users\Mithiran\Documents\RedHope_BackEnd\redHope\test\routes\api\main\v1\donors\events\index.test.js

const t = require("tap");
const { build } = require("../../../../../../../helper");

t.test("POST /api/main/v1/donors/events/create", async (t) => {
  const app = await build(t);

  const payload = {
    donor_id: 1,
    title: "Blood Donation Drive",
    start_time: "2023-08-15T10:00:00Z",
    end_time: "2023-08-15T16:00:00Z",
    address: "456 Hospital St",
    color: "red",
    reminder: "2023-08-14T10:00:00Z",
    description: "Annual blood donation event",
  };

  const res = await app.inject({
    method: "POST",
    url: "/api/main/v1/donors/events/create",
    payload,
  });

  t.equal(res.statusCode, 201, "returns a status code of 201");
  const response = JSON.parse(res.payload);
  t.match(response, payload, "returns the created event");
  t.ok(response.id, "response includes an id");
});

t.test("GET /api/main/v1/donors/events/:id", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "GET",
    url: "/api/main/v1/donors/events/1",
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.ok(response.id, "returns an event with an id");
  t.ok(response.title, "returns an event with a title");
});

// Additional tests for other routes (PUT /:id, DELETE /:id, GET /browse/:donorId) would go here
