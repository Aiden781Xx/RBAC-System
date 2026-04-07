import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    companyType: {
      type: String,
      enum: ["BUYER", "SUPPLIER"],
      required: true,
    },
    country: String,
    registrationNumber: String,
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    website: String,
    linkedIn: String,
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export default mongoose.models.Company || mongoose.model("Company", companySchema);
 
