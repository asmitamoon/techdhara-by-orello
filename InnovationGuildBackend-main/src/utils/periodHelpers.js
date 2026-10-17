const normalizePeriodDate = (dateString, reportingPeriod) => {
  const date = new Date(dateString);

  if (reportingPeriod === 'Daily') {
    date.setHours(0, 0, 0, 0);
    return date;
  }

  if (reportingPeriod === 'Monthly') {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  if (reportingPeriod === 'Yearly') {
    return new Date(date.getFullYear(), 0, 1);
  }

  return date;
};

module.exports = {
  normalizePeriodDate
};
