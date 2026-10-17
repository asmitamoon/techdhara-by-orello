const MasterOperation = require('../../../models/MasterOperation');
const catchAsync = require('../../../utils/catchAsync');

const getOperations = catchAsync(async (req, res) => {
  const operations = await MasterOperation.find().sort({ value: 1 }).select('label value -_id');
  res.status(200).json({ status: 'success', data: { operations } });
});

module.exports = { getOperations };
