function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeRecursively(input) {
  if (typeof input === "string") {
    return escapeHtml(input);
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeRecursively);
  }
  if (input && typeof input === "object") {
    for (const key of Object.keys(input)) {
      input[key] = sanitizeRecursively(input[key]);
    }
  }
  return input;
}

export const sanitizeInput = (req, _res, next) => {
  // req.body is a plain object — safe to mutate in-place
  if (req.body && typeof req.body === "object") {
    sanitizeRecursively(req.body);
  }

  // req.query is a GETTER on IncomingMessage in some Node/Express versions —
  // assigning `req.query = ...` throws "Cannot set property query ... which has only a getter".
  // Mutate individual keys in-place instead.
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      const val = req.query[key];
      if (typeof val === "string") {
        req.query[key] = escapeHtml(val);
      } else if (Array.isArray(val)) {
        req.query[key] = val.map(v => (typeof v === "string" ? escapeHtml(v) : v));
      }
    }
  }

  // req.params is read-only in Express routing — mutate keys in-place
  if (req.params && typeof req.params === "object") {
    for (const key of Object.keys(req.params)) {
      if (typeof req.params[key] === "string") {
        req.params[key] = escapeHtml(req.params[key]);
      }
    }
  }

  next();
};
