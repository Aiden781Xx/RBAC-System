import mongoose from "mongoose";

const rfqSchema = new mongoose.Schema(
  {
    // Buyer-visible label (frontend sends `title`, admin pages display it)
    title: {
      type: String,
    },

    // Buyer & company linkage
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    // Commercials
    budgetRange: {
      max: Number,
      min: Number,
      currency: String,
    },

    quantity: {
      bulk: Number,
      trial: Number,
    },

    // Technical details
    rfqType: String,
    engineeringDetails: {
      description: String,
      designRequest: Boolean,
      drawings: [String],
    },
    // Optional flattened fields for convenience (used by some controllers)
    specifications: String,
    drawings: [String],
    designRequest: Boolean,

    // Timeline
    timeLine: {
      expectedDeliveryDate: Date,
    },
    deliveryTerms: String,

    // Admin & marketplace state
    state: {
      type: String,
      enum: [
        "SUBMITTED",
        "UNDER_VALIDATION",
        "CLARIFICATION_REQUIRED",
        "CONFIRMED",
        "REJECTED",
        "CLOSED",
      ],
      default: "SUBMITTED",
    },
    visibleToSuppliers: {
      type: Boolean,
      default: false,
    },
    adminValidation: {
      status: Boolean,
      clarifications: [String],
      rejectionReason: String,
      validatedAt: Date,
      validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Shortlisted suppliers / access control
    shortListedSuppliers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
      },
    ],
    suppliersWithAccess: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
      },
    ],
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

// Scalability indexes
rfqSchema.index({ state: 1, createdAt: -1 });               // Admin RFQ list filtered by state
rfqSchema.index({ buyerId: 1, createdAt: -1 });             // Buyer's own RFQs
rfqSchema.index({ "timeLine.expectedDeliveryDate": 1, state: 1 }); // Overdue/upcoming checks
rfqSchema.index({ visibleToSuppliers: 1, state: 1 });       // Supplier lead matching

export default mongoose.model("Rfq", rfqSchema);
