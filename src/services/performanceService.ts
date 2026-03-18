import axios from 'axios';

const API_URL = 'http://localhost:3000/performance';

export const performanceService = {
  // Lấy danh sách kỳ đánh giá (Học kỳ)
  getCycles: async () => {
    const response = await axios.get(`${API_URL}/cycles`);
    return response.data;
  },
};
