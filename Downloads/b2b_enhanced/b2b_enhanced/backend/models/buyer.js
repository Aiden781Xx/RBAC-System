import mongoose from "mongoose";
const buyerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    buyerStatus: {
      type: String,
      enum: ["PENDING_VERIFICATION", "VERIFIED", "RESTRICTED", "BLACKLISTED"],
      default: "PENDING_VERIFICATION",
      index: true,
    },

    exportIntent: { type: Boolean, default: false },
    exportIntentVerified: { type: Boolean, default: false },

    purchaseAuthority: { type: Boolean, default: false },
    purchaseAuthorityProof: String,

    misuseCount: { type: Number, default: 0 },
    misuseReasons: [String],
    lastMisuseAt: Date,
    misuseLogs: [
      {
        reason: String,
        flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        flaggedAt: { type: Date, default: Date.now },
      }
    ],

    totalRfqs: { type: Number, default: 0 },
    activeRfqs: { type: Number, default: 0 },

    adminNotes: String,

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

buyerSchema.index({ userId: 1 }, { unique: true });
buyerSchema.index({ buyerStatus: 1, exportIntent: 1 });
buyerSchema.index({ companyId: 1 });
buyerSchema.index({ createdAt: -1 });

export default mongoose.models.Buyer || mongoose.model("Buyer", buyerSchema);