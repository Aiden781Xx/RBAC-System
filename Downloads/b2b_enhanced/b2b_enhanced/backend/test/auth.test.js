import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Company from "../models/Company.js";

const API = "/api/auth";

describe("Auth API", () => {
  const buyerEmail = `buyer-${Date.now()}@testcompany.com`;
  const supplierEmail = `supplier-${Date.now()}@testsupplier.com`;

  afterAll(async () => {
    await User.deleteMany({ email: { $in: [buyerEmail, supplierEmail] } });
  });

  describe("POST /buyer/register", () => {
    it("rejects personal email (gmail)", async () => {
      const res = await request(app)
        .post(`${API}/buyer/register`)
        .send({
          name: "Test Buyer",
          email: "user@gmail.com",
          password: "pass1234",
          companyName: "Test Co",
        });
      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Personal email");
    });

    it("rejects short password", async () => {
      const res = await request(app)
        .post(`${API}/buyer/register`)
        .send({
          name: "Test",
          email: "test@company.com",
          password: "123",
          companyName: "Co",
        });
      expect(res.status).toBe(400);
    });

    it("registers buyer with company email", async () => {
      const res = await request(app)
        .post(`${API}/buyer/register`)
        .send({
          name: "Test Buyer",
          email: buyerEmail,
          password: "password123",
          phone: "9876543210",
          companyName: "Test Company",
          companyType: "BUYER",
          country: "India",
        });
      expect(res.status).toBe(201);
      expect(res.body.userId).toBeDefined();
      expect(res.body.verificationCodes?.emailCode).toBeDefined();
    });

    it("rejects duplicate email", async () => {
      const res = await request(app)
        .post(`${API}/buyer/register`)
        .send({
          name: "Test Buyer 2",
          email: buyerEmail,
          password: "password123",
          companyName: "Test Company",
          companyType: "BUYER",
        });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /supplier/register", () => {
    it("registers supplier", async () => {
      const res = await request(app)
        .post(`${API}/supplier/register`)
        .send({
          name: "Test Supplier",
          email: supplierEmail,
          password: "password123",
          companyName: "Test Supplier Co",
          capabilities: ["MACHINING", "CASTING"],
        });
      expect(res.status).toBe(201);
      expect(res.body.message).toContain("Supplier registered");
      expect(res.body.userId).toBeDefined();
    });

    it("rejects missing required fields", async () => {
      const res = await request(app)
        .post(`${API}/supplier/register`)
        .send({ email: "a@b.com" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /supplier/login", () => {
    it("logs in supplier", async () => {
      const res = await request(app)
        .post(`${API}/supplier/login`)
        .send({ email: supplierEmail, password: "password123" });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.userType).toBe("supplier");
    });

    it("rejects wrong password", async () => {
      const res = await request(app)
        .post(`${API}/supplier/login`)
        .send({ email: supplierEmail, password: "wrongpass123" });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /buyer/login", () => {
    it("logs in buyer", async () => {
      const res = await request(app)
        .post(`${API}/buyer/login`)
        .send({ email: buyerEmail, password: "password123" });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.userType).toBe("buyer");
    });
  });
});
