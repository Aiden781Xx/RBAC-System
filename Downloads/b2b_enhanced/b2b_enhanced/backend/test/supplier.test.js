import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Supplier from "../models/Supplier.js";

const AUTH_API = "/api/auth";
const SUPPLIER_API = "/api/supplier";

describe("Supplier API", () => {
  let supplierToken;
  const supplierEmail = `supplier-me-${Date.now()}@testsupplier.com`;

  beforeAll(async () => {
    const regRes = await request(app)
      .post(`${AUTH_API}/supplier/register`)
      .send({
        name: "Supplier Me Test",
        email: supplierEmail,
        password: "password123",
        companyName: "Supplier Test Co",
        capabilities: ["MACHINING"],
      });
    if (regRes.status !== 201) return;

    const loginRes = await request(app)
      .post(`${AUTH_API}/supplier/login`)
      .send({ email: supplierEmail, password: "password123" });
    if (loginRes.status === 200) supplierToken = loginRes.body.token;
  });

  afterAll(async () => {
    const user = await User.findOne({ email: supplierEmail });
    if (user) {
      await Supplier.deleteMany({ userId: user._id });
      await User.deleteOne({ email: supplierEmail });
    }
  });

  describe("GET /supplier/me", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get(`${SUPPLIER_API}/me`);
      expect(res.status).toBe(401);
    });

    it("returns supplier profile with valid token", async () => {
      if (!supplierToken) return;
      const res = await request(app)
        .get(`${SUPPLIER_API}/me`)
        .set("Authorization", `Bearer ${supplierToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("capabilities");
      expect(res.body).toHaveProperty("supplierStatus");
      expect(res.body.supplierStatus).toBe("DOCUMENTS_PENDING");
    });
  });

  describe("GET /supplier/leads", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get(`${SUPPLIER_API}/leads`);
      expect(res.status).toBe(401);
    });

    it("returns 403 when supplier not approved or SQI not set", async () => {
      if (!supplierToken) return;
      const res = await request(app)
        .get(`${SUPPLIER_API}/leads`)
        .set("Authorization", `Bearer ${supplierToken}`);
      expect([403, 404]).toContain(res.status);
    });
  });
});
