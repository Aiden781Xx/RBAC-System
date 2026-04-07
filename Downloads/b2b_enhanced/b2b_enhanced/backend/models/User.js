 import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      required: function() {
        return this.role !== "ADMIN";
      },
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["BUYER", "SUPPLIER", "ADMIN"],
      required: true,
    },
    userType: {
      type: String,
      enum: ["buyer", "supplier", "admin"],
    },
    // Global status
    status: {
      type: String,
      enum: ["PENDING_VERIFICATION", "VERIFIED", "RESTRICTED", "BLACKLISTED"],
      default: "PENDING_VERIFICATION",
    },
    accountStatus: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    // Admin only
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    permissions: [{
      type: String,
      enum: [
        "BUYER_VERIFY",
        "BUYER_RESTRICT",
        "BUYER_BLACKLIST",
        "RFQ_VALIDATE",
        "SUPPLIER_ONBOARD",
        "SQI_MANAGE",
        "LEAD_PRICING",
        "DISPUTE_RESOLVE",
      ],
    }],
    // Audit
    lastLoginAt: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  { 
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } 
  }
);

userSchema.index({ role: 1, status: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);