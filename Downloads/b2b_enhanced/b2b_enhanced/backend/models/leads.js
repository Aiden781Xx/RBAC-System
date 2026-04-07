import mongoose from "mongoose";

const leadsSchema = new mongoose.Schema(
  {
    isPurchased: Boolean,
    leadScore: Number,
    price: Number,
    purchasedAt: Date,
    rfqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RFQ",
    },
    status: String,
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    visibilityType: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Leads || mongoose.model("Leads", leadsSchema);
