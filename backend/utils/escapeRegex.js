// Escape every character that has a special meaning inside a MongoDB $regex,
// so user supplied search text can never throw "Regular expression is invalid".
// Example: '(' or '[' used to crash the query with a 500.
export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default escapeRegex;
