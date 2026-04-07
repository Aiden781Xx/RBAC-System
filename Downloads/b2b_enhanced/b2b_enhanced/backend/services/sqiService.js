export const calculateSQI = (components = {}) => {
  return Math.round(
    (components.certifications || 0) * 0.3 +
      (components.processCapability || 0) * 0.25 +
      (components.exportMaturity || 0) * 0.25 +
      (components.platformPerformance || 0) * 0.2
  );
};

export const getSQITier = (score = 0) => {
  if (score >= 85) return "PLATINUM";
  if (score >= 70) return "GOLD";
  if (score >= 50) return "SILVER";
  return "BRONZE";
};

export const applySQI = (supplier) => {
  const components = supplier?.SQI?.components || {};
  const score = calculateSQI(components);
  supplier.SQI = supplier.SQI || {};
  supplier.SQI.score = score;
  supplier.SQI.level = getSQITier(score);
  return supplier;
};