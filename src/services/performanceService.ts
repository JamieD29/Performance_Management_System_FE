import { api } from "./api";

const RESOURCE_PATH = "/performance";

export const performanceService = {
  // Fetch the list of evaluation cycles (e.g., semesters)
  getCycles: async () => {
    const response = await api.get(`${RESOURCE_PATH}/cycles`);
    return response.data;
  },

  // Fetch KPI templates containing criteria groups
  getTemplates: async () => {
    const response = await api.get(`${RESOURCE_PATH}/template`);
    return response.data;
  },

  // Submit self-evaluation KPI for a user
  submitKpi: async (userId: string, data: any) => {
    // Note: The payload structure must match the updated backend controller
    const payload = {
      userId: userId,
      data: data, // Includes cycleId and evaluated items
    };
    const response = await api.post(`${RESOURCE_PATH}/kpi/submit`, payload);
    return response.data;
  },

  // Fetch self KPI history for a specific cycle (Optional - for future use)
  getMyKpis: async (userId: string, cycleId: string) => {
    const response = await api.get(`${RESOURCE_PATH}/kpi/my-kpi`, {
      params: { userId, cycleId },
    });
    return response.data;
  },

  // --- Manager Approval Services ---

  // Fetch KPI list of a specific employee (used by managers to view team members' KPIs)
  getUserKpis: async (userId: string, cycleId: string) => {
    const response = await api.get(`${RESOURCE_PATH}/kpi/my-kpi`, {
      params: { userId, cycleId },
    });
    return response.data;
  },

  // Submit review grading result and comment from the manager
  reviewKpi: async (payload: {
    id: string;
    managerScore: number;
    status: string;
    managerComment: string;
  }) => {
    const response = await api.post(`${RESOURCE_PATH}/manager/review`, payload);
    return response.data;
  },

  // Fetch department overview lists of employees pending review for a specific cycle
  getDepartmentOverview: async (cycleId: string) => {
    const response = await api.get(`${RESOURCE_PATH}/manager/overview`, {
      params: { cycleId },
    });
    return response.data;
  },
};

