import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app.js";

const API = "/api/auth";
const ADMIN_API = "/api/admin";

const ADMIN_EMAIL = "admin-test@b2b-platform.com";
const ADMIN_PASSWORD = "admin123";

describe("Admin API", () => {
  let adminToken;

  beforeAll(async () => {
    const setupRes = await request(app)
      .post(`${API}/admin/setup`)
      .send({ name: "Test Admin", email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    if (setupRes.status === 201) {
      adminToken = setupRes.body.token;
    } else {
      const loginRes = await request(app)
        .post(`${API}/admin/login`)
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      if (loginRes.status === 200) adminToken = loginRes.body.token;
    }
  });

  describe("GET /admin/buyers", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get(`${ADMIN_API}/buyers`);
      expect(res.status).toBe(401);
    });

    it("returns buyers with admin token", async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get(`${ADMIN_API}/buyers`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /admin/overview", () => {
    it("returns overview with admin token", async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get(`${ADMIN_API}/overview`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("buyers");
      expect(res.body).toHaveProperty("suppliers");
      expect(res.body).toHaveProperty("rfqs");
    });
  });

  describe("PATCH /admin/buyers/:buyerId/verify", () => {
    it("returns 401 without token", async () => {
      const res = await request(app)
        .patch(`${ADMIN_API}/buyers/507f1f77bcf86cd799439011/verify`);
      expect(res.status).toBe(401);
    });
  });
});
