// File: C:\Users\Mithiran\Documents\RedHope_BackEnd\redHope\test\routes\api\main\v1\hospital\auth\index.test.js

const t = require("tap");
const { build } = require("../../../../../../../helper");

t.test("POST /api/main/v1/hospital/auth/register", async (t) => {
  const app = await build(t);

  const payload = {
    name: "City Hospital",
    email: "city@hospital.com",
    password: "hospital123",
    phone_number: "9876543210",
    country_code: "+1",
    address: "789 Hospital Road",
  };

  const res = await app.inject({
    method: "POST",
    url: "/api/main/v1/hospital/auth/register",
    payload,
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.match(
    response,
    {
      name: payload.name,
      phone_number: payload.phone_number,
      address: payload.address,
    },
    "returns the correct hospital data"
  );
  t.ok(response.token, "response includes a token");
});

t.test("POST /api/main/v1/hospital/auth/login", async (t) => {
  const app = await build(t);

  const payload = {
    email: "city@hospital.com",
    password: "hospital123",
  };

  const res = await app.inject({
    method: "POST",
    url: "/api/main/v1/hospital/auth/login",
    payload,
  });

  t.equal(res.statusCode, 200, "returns a status code of 200");
  const response = JSON.parse(res.payload);
  t.ok(response.id, "returns an id");
  t.equal(response.name, "City Hospital", "returns the correct name");
  t.ok(response.token, "returns a token");
});

// Additional tests for refresh and logout routes would go here
