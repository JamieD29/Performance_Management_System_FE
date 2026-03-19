import { api } from './api';

const RESOURCE_PATH = '/performance';

export const performanceService = {
  // Lấy danh sách kỳ đánh giá (Học kỳ)
  getCycles: async () => {
    const response = await api.get(`${RESOURCE_PATH}/cycles`);
    return response.data;
  },

  // 2. Lấy mẫu KPI (Nhóm A, B và các tiêu chí)
  getTemplates: async () => {
    const response = await api.get(`${RESOURCE_PATH}/template`);
    return response.data;
  },

  // 3. Gửi đánh giá (Submit)
  submitKpi: async (userId: string, data: any) => {
    // Lưu ý: Cấu trúc body phải khớp với Backend Controller đã sửa
    const payload = {
      userId: userId,
      data: data, // Bao gồm cycleId và items
    };
    const response = await api.post(`${RESOURCE_PATH}/kpi/submit`, payload);
    return response.data;
  },

  // 4. Xem lịch sử (Optional - dùng sau)
  getMyKpis: async (userId: string, cycleId: string) => {
    const response = await api.get(`${RESOURCE_PATH}/kpi/my-kpi`, {
      params: { userId, cycleId },
    });
    return response.data;
  },

  //Duyệt
  // 1. Lấy danh sách KPI của một User bất kỳ (Sếp xem nhân viên)
  getUserKpis: async (userId: string, cycleId: string) => {
    const response = await api.get(`${RESOURCE_PATH}/kpi/my-kpi`, {
      params: { userId, cycleId },
    });
    return response.data;
  },

  // 2. Gửi kết quả Duyệt (Chấm điểm)
  reviewKpi: async (payload: {
    id: string;
    managerScore: number;
    status: string;
    managerComment: string;
  }) => {
    const response = await api.post(`${RESOURCE_PATH}/manager/review`, payload);
    return response.data;
  },

  // 3. Lấy danh sách nhân viên cần duyệt trong kỳ
  getDepartmentOverview: async (cycleId: string) => {
    const response = await api.get(`${RESOURCE_PATH}/manager/overview`, {
      params: { cycleId },
    });
    return response.data;
  },
};
