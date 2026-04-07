import Buyer from "../models/buyer.js";
import User from "../models/User.js";

export const getAllBuyers = async (req, res) => {
  try {
    const { status, page = 1, limit = 200 } = req.query;
    const filter = { isDeleted: { $ne: true } };
    if (status) filter.buyerStatus = status;

    const [buyers, total] = await Promise.all([
      Buyer.find(filter)
        .populate("userId", "name email status isEmailVerified isPhoneVerified createdAt phone")
        .populate("companyId", "companyName country website registrationNumber")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Buyer.countDocuments(filter),
    ]);

    res.json({ buyers, total, page: Number(page) });
  } catch (err) {
    console.error("getAllBuyers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPendingBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.find({ buyerStatus: "PENDING_VERIFICATION", isDeleted: { $ne: true } })
      .populate("userId", "name email status isEmailVerified")
      .populate("companyId", "companyName country")
      .sort({ createdAt: -1 })
      .lean();
    res.json(buyers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.buyerId);
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    if (buyer.isDeleted) return res.status(400).json({ message: "Buyer account deleted" });

    const user = await User.findById(buyer.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Admin can verify - email verification is encouraged but not a hard block for admin
    if (buyer.buyerStatus === "VERIFIED") {
      return res.status(400).json({ message: "Buyer already verified" });
    }

    buyer.buyerStatus = "VERIFIED";
    buyer.verifiedBy = req.user.userId;
    buyer.verifiedAt = new Date();
    await buyer.save();

    // Sync user status
    await User.findByIdAndUpdate(buyer.userId, { status: "VERIFIED" });

    res.json({
      message: "Buyer verified successfully",
      buyerId: req.params.buyerId,
      newStatus: "VERIFIED",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("verifyBuyer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const restrictBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.buyerId);
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    if (buyer.buyerStatus === "RESTRICTED") return res.status(400).json({ message: "Buyer already restricted" });

    const { reason } = req.body;
    buyer.buyerStatus = "RESTRICTED";
    if (reason) {
      buyer.misuseReasons = [...(buyer.misuseReasons || []), reason];
      buyer.misuseLogs.push({ reason, flaggedBy: req.user.userId, flaggedAt: new Date() });
    }
    await buyer.save();
    await User.findByIdAndUpdate(buyer.userId, { status: "RESTRICTED" });

    res.json({ message: "Buyer restricted", buyerId: req.params.buyerId, newStatus: "RESTRICTED" });
  } catch (err) {
    console.error("restrictBuyer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const unrestrictBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.buyerId);
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });

    buyer.buyerStatus = "VERIFIED";
    await buyer.save();
    await User.findByIdAndUpdate(buyer.userId, { status: "VERIFIED" });

    res.json({ message: "Buyer unrestricted successfully", buyerId: req.params.buyerId, newStatus: "VERIFIED" });
  } catch (err) {
    console.error("unrestrictBuyer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const blacklistBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.buyerId);
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    if (buyer.buyerStatus === "BLACKLISTED") return res.status(400).json({ message: "Buyer already blacklisted" });

    const { reason } = req.body;
    buyer.buyerStatus = "BLACKLISTED";
    if (reason) buyer.misuseLogs.push({ reason, flaggedBy: req.user.userId, flaggedAt: new Date() });
    await buyer.save();
    await User.findByIdAndUpdate(buyer.userId, { status: "BLACKLISTED" });

    res.json({ message: "Buyer blacklisted", buyerId: req.params.buyerId, newStatus: "BLACKLISTED" });
  } catch (err) {
    console.error("blacklistBuyer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBuyerById = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.buyerId)
      .populate("userId", "name email status isEmailVerified isPhoneVerified createdAt phone")
      .populate("companyId", "companyName country website registrationNumber")
      .lean();
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    res.json(buyer);
  } catch (err) {
    console.error("getBuyerById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
