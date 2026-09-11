import axios from "axios";
import {
  User, Industry, Assessment, SimulatorResult,
  Scenario, ActionPlanItem, DashboardSummary, DemoFactory
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("carbon_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });
    if (res.data.data?.token) {
      localStorage.setItem("carbon_token", res.data.data.token);
      localStorage.setItem("carbon_user", JSON.stringify(res.data.data.user));
    }
    return res.data;
  },
  register: async (userData: { email: string; password: string; full_name: string; role?: string }) => {
    const res = await apiClient.post("/auth/register", userData);
    if (res.data.data?.token) {
      localStorage.setItem("carbon_token", res.data.data.token);
      localStorage.setItem("carbon_user", JSON.stringify(res.data.data.user));
    }
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data.data as User;
  },
  logout: () => {
    localStorage.removeItem("carbon_token");
    localStorage.removeItem("carbon_user");
    localStorage.removeItem("carbon_active_assessment");
  },
};

export const industryApi = {
  getProfile: async () => {
    const res = await apiClient.get("/industry/profile");
    return res.data.data as Industry;
  },
  updateProfile: async (profile: Partial<Industry>) => {
    const res = await apiClient.put("/industry/profile", profile);
    return res.data.data as Industry;
  },
};

export const assessmentApi = {
  list: async () => {
    const res = await apiClient.get("/assessments");
    return res.data.data as Assessment[];
  },
  create: async (data: any) => {
    const res = await apiClient.post("/assessments", data);
    return res.data.data as Assessment;
  },
  get: async (id: number) => {
    const res = await apiClient.get(`/assessments/${id}`);
    return res.data.data as Assessment;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/assessments/${id}`);
    return res.data;
  },
};

export const analysisApi = {
  calculate: async (assessmentId: number) => {
    const res = await apiClient.post(`/assessments/${assessmentId}/calculate`);
    return res.data.data;
  },
  getEmissions: async (assessmentId: number) => {
    const res = await apiClient.get(`/assessments/${assessmentId}/emissions`);
    return res.data.data;
  },
  getHotspots: async (assessmentId: number) => {
    const res = await apiClient.get(`/assessments/${assessmentId}/hotspots`);
    return res.data.data;
  },
  getRecommendations: async (assessmentId: number) => {
    const res = await apiClient.get(`/assessments/${assessmentId}/recommendations`);
    return res.data.data;
  },
};

export const simulatorApi = {
  calculate: async (assessmentId: number, inputs: {
    solar_percentage: number;
    recycled_material_percentage: number;
    waste_recovery_percentage: number;
    transport_reduction_percentage: number;
  }) => {
    const res = await apiClient.post(`/simulator/calculate?assessment_id=${assessmentId}`, inputs);
    return res.data.data as SimulatorResult;
  },
  getScenarios: async (assessmentId: number) => {
    const res = await apiClient.get(`/simulator/compare/${assessmentId}`);
    return res.data.data as Scenario[];
  },
  saveScenario: async (assessmentId: number, scenario: {
    name: string;
    description?: string;
    solar_percentage: number;
    recycled_material_percentage: number;
    waste_recovery_percentage: number;
    transport_reduction_percentage: number;
  }) => {
    const res = await apiClient.post(`/simulator/scenario?assessment_id=${assessmentId}`, scenario);
    return res.data.data;
  },
};

export const actionPlanApi = {
  list: async (assessmentId?: number) => {
    const url = assessmentId ? `/action-plans?assessment_id=${assessmentId}` : "/action-plans";
    const res = await apiClient.get(url);
    return res.data.data as ActionPlanItem[];
  },
  create: async (assessmentId: number, data: Partial<ActionPlanItem>) => {
    const res = await apiClient.post(`/action-plans?assessment_id=${assessmentId}`, data);
    return res.data.data as ActionPlanItem;
  },
  update: async (actionId: number, data: Partial<ActionPlanItem>) => {
    const res = await apiClient.put(`/action-plans/${actionId}`, data);
    return res.data.data as ActionPlanItem;
  },
  delete: async (actionId: number) => {
    const res = await apiClient.delete(`/action-plans/${actionId}`);
    return res.data;
  },
};

export const dashboardApi = {
  getSummary: async (assessmentId?: number) => {
    const url = assessmentId ? `/dashboard/summary?assessment_id=${assessmentId}` : "/dashboard/summary";
    const res = await apiClient.get(url);
    return res.data.data as DashboardSummary;
  },
};

export const reportApi = {
  getReport: async (assessmentId: number) => {
    const res = await apiClient.get(`/reports/${assessmentId}`);
    return res.data.data;
  },
  getPdfDownloadUrl: (assessmentId: number) => {
    return `${API_BASE_URL}/reports/${assessmentId}/pdf`;
  },
};

export const assistantApi = {
  chat: async (assessmentId: number | undefined, message: string) => {
    const res = await apiClient.post("/assistant/chat", {
      assessment_id: assessmentId,
      message,
    });
    return res.data.data;
  },
};

export const demoApi = {
  getFactories: async () => {
    const res = await apiClient.get("/demo/factories");
    return res.data.data as DemoFactory[];
  },
  loadFactory: async (factoryId: number) => {
    const res = await apiClient.post(`/demo/load/${factoryId}`);
    if (res.data.data?.token) {
      localStorage.setItem("carbon_token", res.data.data.token);
      localStorage.setItem("carbon_user", JSON.stringify(res.data.data.user));
      if (res.data.data.assessment_id) {
        localStorage.setItem("carbon_active_assessment", res.data.data.assessment_id.toString());
      }
    }
    return res.data.data;
  },
};

export default apiClient;
