function findCommonKeywords(array1, array2) {
  if (!Array.isArray(array1) || !Array.isArray(array2)) {
    return [];
  }

  const set2 = new Set(array2);
  const common = array1.filter(keyword => set2.has(keyword));
  return [...new Set(common)];
}

module.exports = {
  findCommonKeywords
};
