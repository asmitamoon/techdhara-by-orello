import api from '../axiosInstance';

export const importFromWebsite = (url) =>
  api.post('/innovator/ai/import-from-website', { url }).then((r) => r.data);
