import mongoose from "mongoose";

const quotesSchema = new mongoose.Schema(
  {
    leadTimeDays: Number,
    quotedPrice: Number,
    remarks: String,
    rfqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RFQ",
    },
    status: String,
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Quotes || mongoose.model("Quotes", quotesSchema);
