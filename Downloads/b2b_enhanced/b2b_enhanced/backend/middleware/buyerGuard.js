 import Buyer from "../models/buyer.js";

const buyerGuard = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.userType !== "buyer") {
      return res.status(403).json({ message: "Buyer role required" });
    }

    const buyer = await Buyer.findOne({ userId: req.user.userId });

    if (!buyer) {
      return res.status(403).json({ message: "Buyer profile not found" });
    }

    if (buyer.buyerStatus !== "VERIFIED") {
      return res.status(403).json({
        message: `Buyer is ${buyer.buyerStatus}`,
      });
    }

    if (!buyer.purchaseAuthority) {
      return res.status(403).json({
        message: "Purchase authority declaration required",
      });
    }

    req.buyer = buyer;
    next();
  } catch (err) {
    res.status(500).json({ message: "Buyer guard error" });
  }
};

export default buyerGuard;
