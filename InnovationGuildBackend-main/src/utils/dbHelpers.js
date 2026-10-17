const MasterOperation = require('../models/MasterOperation');

const upsertOperations = async (rawOps) => {
  const ops = Array.isArray(rawOps)
    ? rawOps
    : typeof rawOps === 'string' && rawOps.startsWith('[')
      ? JSON.parse(rawOps)
      : rawOps
        ? [rawOps]
        : [];
  if (ops.length === 0) return;
  await Promise.all(ops.map(val =>
    MasterOperation.findOneAndUpdate(
      { value: val },
      { $setOnInsert: { label: val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, ' '), value: val, isUserAdded: true } },
      { upsert: true }
    )
  ));
};

module.exports = { upsertOperations };
