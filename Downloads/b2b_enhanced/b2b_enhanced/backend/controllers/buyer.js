import Buyer from "../models/buyer.js";
import Company from "../models/Company.js";
import User from "../models/User.js";

// Create buyer profile
export const createBuyerProfile = async (req, res) => {
  try {
    const {
      companyName,
      companyRegistration,
      website,
      linkedinProfile,
      phone,
      purchaseAuthority,
      exportIntent,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user || user.role !== "BUYER") {
      return res.status(403).json({ message: "Only buyers allowed" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Email must be verified first" });
    }

    const existing = await Buyer.findOne({ userId: user._id });

    // Create company
    const company = await Company.create({
      companyName,
      companyType: "BUYER",
      registrationNumber: companyRegistration,
      website,
      linkedIn: linkedinProfile,
    });

    // Create or update buyer profile
    let buyer;
    if (existing) {
      existing.companyId = company._id;
      existing.purchaseAuthority = purchaseAuthority || false;
      existing.exportIntent = exportIntent || false;
      if (!existing.buyerStatus) existing.buyerStatus = "PENDING_VERIFICATION";
      buyer = await existing.save();
    } else {
      buyer = await Buyer.create({
        userId: user._id,
        companyId: company._id,
        purchaseAuthority: purchaseAuthority || false,
        exportIntent: exportIntent || false,
        buyerStatus: "PENDING_VERIFICATION",
      });
    }

    // Update user phone if provided
    if (phone) {
      user.phone = phone;
      await user.save();
    }

    // Sync user status
    user.status = "PENDING_VERIFICATION";
    await user.save();

    res.status(existing ? 200 : 201).json({
      message: existing
        ? "Buyer profile updated. Awaiting admin verification."
        : "Buyer profile created. Awaiting admin verification.",
      buyer: {
        id: buyer._id,
        buyerStatus: buyer.buyerStatus,
      },
    });
  } catch (err) {
    console.error("createBuyerProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Declare purchase authority (1.3)
export const declarePurchaseAuthority = async (req, res) => {
  try {
    const { hasAuthority, proofDocument } = req.body;

    const buyer = await Buyer.findOne({ userId: req.user.userId });
    if (!buyer) {
      return res.status(404).json({ message: "Buyer profile not found" });
    }

    buyer.purchaseAuthority = hasAuthority;
    if (proofDocument) {
      buyer.purchaseAuthorityProof = proofDocument;
    }

    await buyer.save();

    res.json({ 
      message: hasAuthority ? "Purchase authority declared" : "Purchase authority declined",
      purchaseAuthority: buyer.purchaseAuthority
    });
  } catch (err) {
    console.error("declarePurchaseAuthority error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get buyer profile
export const getBuyerProfile = async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ userId: req.user.userId })
      .populate("companyId", "companyName website")
      .populate("verifiedBy", "name email");

    if (!buyer) {
      return res.status(404).json({ message: "Buyer profile not found" });
    }

    res.status(200).json(buyer);
  } catch (err) {
    console.error("getBuyerProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Flag misuse (1.5) - Admin only
export const flagBuyerMisuse = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { reason } = req.body;

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    buyer.misuseCount = (buyer.misuseCount || 0) + 1;
    buyer.misuseReasons = buyer.misuseReasons || [];
    buyer.misuseReasons.push(reason);
    buyer.lastMisuseAt = new Date();
    buyer.misuseLogs = buyer.misuseLogs || [];
    buyer.misuseLogs.push({ reason, flaggedBy: req.user.userId, flaggedAt: new Date() });

    // Auto-restrict at 3 flags
    if (buyer.misuseCount >= 3) {
      buyer.buyerStatus = "RESTRICTED";
      
      // Sync with User model
      await User.findByIdAndUpdate(buyer.userId, {
        status: "RESTRICTED",
        accountStatus: "SUSPENDED"
      });
    }

    await buyer.save();

    res.json({ 
      message: "Misuse flagged", 
      misuseCount: buyer.misuseCount,
      status: buyer.buyerStatus 
    });
  } catch (err) {
    console.error("flagBuyerMisuse error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if buyer can create RFQ (called by RFQ controller)
export const checkBuyerEligibility = async (userId) => {
  const buyer = await Buyer.findOne({ userId });

  if (!buyer) return { eligible: false, reason: "Buyer profile not found" };
  if (buyer.buyerStatus !== "VERIFIED") return { eligible: false, reason: "Not verified" };
  if (!buyer.purchaseAuthority) return { eligible: false, reason: "No purchase authority" };
  if (buyer.misuseCount >= 3) return { eligible: false, reason: "Account restricted" };
  if (buyer.activeRfqs >= 5) return { eligible: false, reason: "Max active RFQs reached" };

  return { eligible: true, buyer };
};

// Increment active RFQ count
export const incrementActiveRfqs = async (buyerId) => {
  await Buyer.findByIdAndUpdate(buyerId, { $inc: { activeRfqs: 1, totalRfqs: 1 } });
};

// Decrement active RFQ count
export const decrementActiveRfqs = async (buyerId) => {
  await Buyer.findByIdAndUpdate(buyerId, { $inc: { activeRfqs: -1 } });
};
 
