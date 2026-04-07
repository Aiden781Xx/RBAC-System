import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    isPurchased: {
      type: Boolean,
      default: false,
    },

    leadScore: Number,

    price: Number,

    purchasedAt: Date,

    expiresAt: {
      type: Date,
      required: true,
    },

    isConverted: {
      type: Boolean,
      default: false,
    },

    convertedAt: Date,

    acceptedQuoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
    },

    rfqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rfq",
      required: true,
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "PURCHASED", "EXPIRED", "REFUNDED"],
      default: "AVAILABLE",
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    visibilityType: {
      type: String,
      enum: ["NORMAL", "PRIORITY", "EXCLUSIVE"],
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

leadSchema.index({ rfqId: 1, supplierId: 1 }, { unique: true });
leadSchema.index({ expiresAt: 1 });
leadSchema.index({ supplierId: 1, status: 1, createdAt: -1 }); // Supplier's leads filtered by status
leadSchema.index({ status: 1, createdAt: -1 });                // Admin leads list
leadSchema.index({ isPurchased: 1, rfqId: 1 });                // Flow health purchased check

export default mongoose.model("Lead", leadSchema);
