import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    capabilities: {
      processTypes: { type: [String], required: true },
      materials: [String],
      toleranceRange: String,
      machineList: [String],
      maxCapacity: String,
    },
    certifications: [{
      name: { type: String, required: true },
      issuedBy: String,
      validUntil: Date,
      documentUrl: String,
    }],
    exportExperience: {
      years: { type: Number, default: 0 },
      countries: [String],
      documentProof: String,
    },
    SQI: {
      score: { type: Number, default: 0, min: 0, max: 100 },
      components: {
        certifications: { type: Number, default: 0 },
        processCapability: { type: Number, default: 0 },
        exportMaturity: { type: Number, default: 0 },
        platformPerformance: { type: Number, default: 0 },
      },
      level: {
        type: String,
        enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM"],
        default: "BRONZE",
      },
      calculatedAt: Date,
      calculatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    supplierStatus: {
      type: String,
      enum: ["DOCUMENTS_PENDING", "UNDER_REVIEW", "APPROVED", "RESTRICTED", "BLACKLISTED"],
      default: "DOCUMENTS_PENDING",
    },
    leadAccess: {
      dailyLimit: { type: Number, default: 3 },
      usedToday: { type: Number, default: 0 },
      resetAt: Date,
      totalLeadsPurchased: { type: Number, default: 0 },
      totalQuotesSubmitted: { type: Number, default: 0 },
      totalLeadsConverted: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      exclusive: { type: Boolean, default: false },
      premium: { type: Boolean, default: false },
    },
    performance: {
      avgResponseTime: Number,
      quoteSeriousnessScore: Number,
      buyerFeedbackScore: Number,
      disputeCount: { type: Number, default: 0 },
      lastDisputeAt: Date,
      lastResolvedAt: Date,
      lastResolutionNote: String,
      totalDisputesHistoric: { type: Number, default: 0 },
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    adminNotes: String,
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

supplierSchema.index({ "SQI.score": -1, supplierStatus: 1 });
supplierSchema.index({ "capabilities.processTypes": 1 });

// FIX: Correct status mapping - APPROVED => VERIFIED (valid User status)
supplierSchema.pre("save", async function () {
  if (this.isModified("supplierStatus")) {
    let userStatus;
    if (this.supplierStatus === "APPROVED") {
      userStatus = "VERIFIED";
    } else if (this.supplierStatus === "DOCUMENTS_PENDING" || this.supplierStatus === "UNDER_REVIEW") {
      userStatus = "PENDING_VERIFICATION";
    } else if (this.supplierStatus === "RESTRICTED") {
      userStatus = "RESTRICTED";
    } else if (this.supplierStatus === "BLACKLISTED") {
      userStatus = "BLACKLISTED";
    }
    if (userStatus) {
      await mongoose.model("User").findByIdAndUpdate(this.userId, { status: userStatus });
    }
  }
});

export default mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);
