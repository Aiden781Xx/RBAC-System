import jwt from "jsonwebtoken";

// Lightweight auth middleware — verify JWT only, no DB roundtrip per request.
// Account suspension is enforced at login time (token not issued) and on
// sensitive mutations via guards. This keeps every API call fast.
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized — no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userType) {
      return res.status(401).json({ error: "Invalid token: userType missing" });
    }

    // Standardise identity fields used throughout controllers
    const userId    = decoded.userId || decoded._id || decoded.id;
    const actorId   = decoded.profileId || decoded.id || decoded._id || decoded.userId;

    req.user = {
      id:        actorId,   // profile id (buyer._id / supplier._id / user._id for admin)
      userId,               // raw user._id — used for User/Buyer/Supplier lookups
      userType:  decoded.userType,
      companyId: decoded.companyId,
      profileId: decoded.profileId,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired — please log in again" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default auth;
