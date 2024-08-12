// File: C:\Users\Mithiran\Documents\RedHope_BackEnd\redHope\test\routes\api\main\v1\donors\auth\index.test.js

const t = require("tap");
const { build } = require("../../../../../../../helper");

t.test("POST /api/main/v1/donors/auth/register", async (t) => {
  const app = await build(t);

  const payload = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    address: "123 Main St",
    phone_number: "1234567890",
    country_code: "+1",
    blood_type: "A+",
    fcm_token: "some-fcm-token",
  };

  const res = await app.inject({
    method: "POST",
    url: "/api/main/v1/donors/auth/register",
    payload,
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.match(
    response,
    {
      name: payload.name,
      address: payload.address,
      phone_number: payload.phone_number,
      country_code: payload.country_code,
      blood_type: payload.blood_type,
      fcm_token: payload.fcm_token,
    },
    "returns the correct donor data"
  );
  t.ok(response.token, "response includes a token");
});

t.test("POST /api/main/v1/donors/auth/login", async (t) => {
  const app = await build(t);

  const payload = {
    email: "john@example.com",
    password: "password123",
  };

  const res = await app.inject({
    method: "POST",
    url: "/api/main/v1/donors/auth/login",
    payload,
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.ok(response.id, "returns an id");
  t.equal(response.email, payload.email, "returns the correct email");
  t.ok(response.token, "returns a token");
});

// Additional tests for refresh, updateFCMToken, and logout routes would go here
