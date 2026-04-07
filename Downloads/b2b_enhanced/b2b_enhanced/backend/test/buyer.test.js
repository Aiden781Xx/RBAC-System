import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Buyer from "../models/buyer.js";

const AUTH_API = "/api/auth";
const BUYER_API = "/api/buyer";
const ADMIN_API = "/api/admin";

describe("Buyer API", () => {
  let buyerToken;
  let buyerId;
  const buyerEmail = `buyer-profile-${Date.now()}@testcompany.com`;

  beforeAll(async () => {
    const regRes = await request(app)
      .post(`${AUTH_API}/buyer/register`)
      .send({
        name: "Profile Test Buyer",
        email: buyerEmail,
        password: "password123",
        companyName: "Profile Test Co",
        companyType: "BUYER",
        phone: "9876543210",
      });
    if (regRes.status !== 201) return;

    const user = await User.findOne({ email: buyerEmail });
    if (user) {
      user.isEmailVerified = true;
      await user.save();
    }

    const loginRes = await request(app)
      .post(`${AUTH_API}/buyer/login`)
      .send({ email: buyerEmail, password: "password123" });
    if (loginRes.status === 200) buyerToken = loginRes.body.token;
  });

  afterAll(async () => {
    const user = await User.findOne({ email: buyerEmail });
    if (user) {
      await Buyer.deleteMany({ userId: user._id });
      await User.deleteOne({ email: buyerEmail });
    }
  });

  describe("POST /buyer/profile", () => {
    it("returns 401 without token", async () => {
      const res = await request(app)
        .post(`${BUYER_API}/profile`)
        .send({
          companyName: "Test Co",
          purchaseAuthority: true,
          exportIntent: false,
        });
      expect(res.status).toBe(401);
    });

    it("creates or updates profile when buyer has verified email", async () => {
      if (!buyerToken) return;
      const res = await request(app)
        .post(`${BUYER_API}/profile`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          companyName: "Profile Test Company",
          companyRegistration: "REG123",
          website: "https://test.com",
          purchaseAuthority: true,
          exportIntent: false,
        });
      expect([200, 201]).toContain(res.status);
      expect(res.body.buyer).toHaveProperty("buyerStatus");
      expect(res.body.buyer.buyerStatus).toBe("PENDING_VERIFICATION");
      buyerId = res.body.buyer.id;
    });

    it("updates profile when called again", async () => {
      if (!buyerToken) return;
      const res = await request(app)
        .post(`${BUYER_API}/profile`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          companyName: "Another Co",
          companyRegistration: "REG456",
          purchaseAuthority: true,
          exportIntent: false,
        });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("updated");
    });
  });

  describe("POST /buyer/declare-authority", () => {
    it("declares purchase authority when profile exists", async () => {
      if (!buyerToken) return;
      const res = await request(app)
        .post(`${BUYER_API}/declare-authority`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({ hasAuthority: true });
      expect(res.status).toBe(200);
      expect(res.body.purchaseAuthority).toBe(true);
    });
  });

  describe("GET /buyer/me", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get(`${BUYER_API}/me`);
      expect(res.status).toBe(401);
    });

    it("returns 403 when buyer not admin-verified", async () => {
      if (!buyerToken) return;
      const res = await request(app)
        .get(`${BUYER_API}/me`)
        .set("Authorization", `Bearer ${buyerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("PENDING_VERIFICATION");
    });
  });
});
