const VleProfile = require('../../../models/VleProfile');
const catchAsync = require('../../../utils/catchAsync');

const getVillages = catchAsync(async (req, res) => {
  const { state, district } = req.query;
  const filter = {};
  if (state) filter.state = state;
  if (district) filter.district = district;
  const villages = await VleProfile.distinct('village', filter);
  const villageOptions = villages
    .filter(v => v)
    .sort()
    .map(v => ({ value: v, label: v }));
  res.status(200).json({ status: 'success', data: { villages: villageOptions } });
});

module.exports = { getVillages };
