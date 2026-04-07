import Supplier from "../models/Supplier.js";

const supplierGuard = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== "supplier") return res.status(403).json({ message: "Supplier role required" });

    const supplier = await Supplier.findOne({ userId: req.user.userId });
    if (!supplier) return res.status(403).json({ message: "Supplier profile not found" });

    if (supplier.supplierStatus === "BLACKLISTED") return res.status(403).json({ message: "Supplier blacklisted" });
    if (supplier.supplierStatus === "RESTRICTED") return res.status(403).json({ message: "Supplier restricted" });
    if (supplier.supplierStatus !== "APPROVED") {
      return res.status(403).json({ message: `Supplier status: ${supplier.supplierStatus}` });
    }

    const sqiScore = supplier.SQI?.score ?? 0;
    if (sqiScore < 20) {
      return res.status(403).json({ message: "SQI too low for lead access", currentSQI: sqiScore });
    }

    req.supplier = supplier;
    next();
  } catch (err) {
    console.error("Supplier guard error:", err);
    res.status(500).json({ message: "Supplier guard error" });
  }
};

export default supplierGuard;
