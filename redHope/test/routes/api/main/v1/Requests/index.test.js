// File: C:\Users\Mithiran\Documents\RedHope_BackEnd\redHope\test\routes\api\main\v1\Requests\index.test.js

const t = require("tap");
const { build } = require("../../../../../../helper");

t.test("POST /api/main/v1/Requests/create", async (t) => {
  const app = await build(t);

  const payload = {
    requester_name: "Jane Doe",
    requester_email: "jane@example.com",
    blood_type_requested: "O+",
    nic_number: "1234567890",
    urgency_level: "High",
    phone_number: "1234567890",
    country_code: "+1",
    location: "City Hospital",
    description: "Urgent need for surgery",
  };

  const res = await app.inject({
    method: "POST",
    url: "/api/main/v1/Requests/create",
    payload,
  });

  t.equal(res.statusCode, 201, "returns a status code of 201");
  const response = JSON.parse(res.payload);
  t.match(response.request, payload, "returns the created request");
  t.ok(response.request.id, "response includes an id");
  t.equal(
    response.message,
    "Blood request created successfully and notifications sent",
    "returns success message"
  );
});

t.test("GET /api/main/v1/Requests/all", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "GET",
    url: "/api/main/v1/Requests/all",
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.ok(Array.isArray(response), "returns an array of requests");
});

t.test("GET /api/main/v1/Requests/byBloodType/:bloodType", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "GET",
    url: "/api/main/v1/Requests/byBloodType/O+",
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.ok(Array.isArray(response), "returns an array of requests");
  response.forEach((request) => {
    t.equal(
      request.blood_type_requested,
      "O+",
      "all requests are for O+ blood type"
    );
  });
});

// Additional test for GET /notification route would go here
