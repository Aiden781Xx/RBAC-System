import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    leadTimeDays: Number,

    quotedPrice: Number,

    remarks: String,

    rfqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rfq",
      required: true,
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "REVISED", "ACCEPTED", "REJECTED"],
      default: "SUBMITTED",
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

quoteSchema.index({ rfqId: 1, supplierId: 1 }, { unique: true });
quoteSchema.index({ rfqId: 1, status: 1 });        // Filter quotes by RFQ + status
quoteSchema.index({ supplierId: 1, createdAt: -1 }); // Supplier's quote history
quoteSchema.index({ status: 1, createdAt: -1 });     // Admin quotes list

export default mongoose.model("Quote", quoteSchema);
