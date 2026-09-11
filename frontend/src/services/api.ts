import axios from "axios";
import {
  User, Industry, Assessment, SimulatorResult,
  Scenario, ActionPlanItem, DashboardSummary,
  Hotspot, Recommendation, AdminUserItem,
  EmissionFactorItem, RecommendationKnowledgeItem, AuditLogItem
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- In-Memory Client Cache Engine for Instant Page Navigation ---
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 90 * 1000; // 90 seconds in-memory cache

export const clearApiCache = (subString?: string) => {
  if (!subString) {
    memoryCache.clear();
  } else {
    for (const key of memoryCache.keys()) {
      if (key.includes(subString)) {
        memoryCache.delete(key);
      }
    }
  }
};

export async function cachedGet<T>(
  url: string,
  params?: any,
  options?: { forceRefresh?: boolean; ttlMs?: number }
): Promise<T> {
  const cacheKey = `${url}__${params ? JSON.stringify(params) : ""}`;
  const now = Date.now();
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;

  if (!options?.forceRefresh) {
    const cached = memoryCache.get(cacheKey);
    if (cached && now - cached.timestamp < ttl) {
      return cached.data as T;
    }
  }

  const res = await apiClient.get(url, { params });
  const data = res.data.data;
  memoryCache.set(cacheKey, { data, timestamp: now });
  return data as T;
}

// Attach JWT token from localStorage if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("carbon_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatically invalidate client cache when mutations happen
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const url = response.config.url || "";
    if (method && ["post", "put", "delete", "patch"].includes(method)) {
      if (url.includes("/action-plan")) {
        clearApiCache("/action-plans");
        clearApiCache("/dashboard/summary");
      } else if (url.includes("/simulator") || url.includes("/scenario")) {
        clearApiCache("/simulator/compare");
        clearApiCache("/dashboard/summary");
      } else if (url.includes("/assessments") || url.includes("/calculate")) {
        clearApiCache("/assessments");
        clearApiCache("/hotspots");
        clearApiCache("/recommendations");
        clearApiCache("/emissions");
        clearApiCache("/dashboard/summary");
        clearApiCache("/reports");
      } else if (url.includes("/industry")) {
        clearApiCache("/industry");
        clearApiCache("/dashboard/summary");
      } else if (url.includes("/admin")) {
        clearApiCache("/admin");
      }
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });
    if (res.data.data?.token) {
      localStorage.setItem("carbon_token", res.data.data.token);
      localStorage.setItem("carbon_user", JSON.stringify(res.data.data.user));
      clearApiCache();
    }
    return res.data;
  },
  register: async (userData: { email: string; password: string; full_name: string; role?: string }) => {
    const res = await apiClient.post("/auth/register", userData);
    if (res.data.data?.token) {
      localStorage.setItem("carbon_token", res.data.data.token);
      localStorage.setItem("carbon_user", JSON.stringify(res.data.data.user));
      clearApiCache();
    }
    return res.data;
  },
  getMe: async () => {
    return cachedGet<User>("/auth/me", undefined, { ttlMs: 30000 });
  },
  logout: () => {
    localStorage.removeItem("carbon_token");
    localStorage.removeItem("carbon_user");
    localStorage.removeItem("carbon_active_assessment");
    clearApiCache();
  },
};

export const industryApi = {
  getProfile: async (forceRefresh = false) => {
    return cachedGet<Industry>("/industry/profile", undefined, { forceRefresh, ttlMs: 120000 });
  },
  updateProfile: async (profile: Partial<Industry>) => {
    const res = await apiClient.put("/industry/profile", profile);
    clearApiCache("/industry");
    clearApiCache("/dashboard/summary");
    return res.data.data as Industry;
  },
};

export const assessmentApi = {
  list: async (forceRefresh = false) => {
    return cachedGet<Assessment[]>("/assessments", undefined, { forceRefresh, ttlMs: 60000 });
  },
  create: async (data: any) => {
    const res = await apiClient.post("/assessments", data);
    clearApiCache();
    return res.data.data as Assessment;
  },
  get: async (id: number, forceRefresh = false) => {
    return cachedGet<Assessment>(`/assessments/${id}`, undefined, { forceRefresh, ttlMs: 60000 });
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/assessments/${id}`);
    clearApiCache();
    return res.data;
  },
};

export const analysisApi = {
  calculate: async (assessmentId: number) => {
    const res = await apiClient.post(`/assessments/${assessmentId}/calculate`);
    clearApiCache();
    return res.data.data;
  },
  getEmissions: async (assessmentId: number, forceRefresh = false) => {
    return cachedGet(`/assessments/${assessmentId}/emissions`, undefined, { forceRefresh, ttlMs: 120000 });
  },
  getHotspots: async (assessmentId: number, forceRefresh = false) => {
    return cachedGet<Hotspot[]>(`/assessments/${assessmentId}/hotspots`, undefined, { forceRefresh, ttlMs: 120000 });
  },
  getRecommendations: async (assessmentId: number, forceRefresh = false) => {
    return cachedGet<Recommendation[]>(`/assessments/${assessmentId}/recommendations`, undefined, { forceRefresh, ttlMs: 120000 });
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
  getScenarios: async (assessmentId: number, forceRefresh = false) => {
    return cachedGet<Scenario[]>(`/simulator/compare/${assessmentId}`, undefined, { forceRefresh, ttlMs: 120000 });
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
    clearApiCache(`/simulator/compare/${assessmentId}`);
    return res.data.data;
  },
};

export const actionPlanApi = {
  list: async (assessmentId?: number, forceRefresh = false) => {
    const url = assessmentId ? `/action-plans?assessment_id=${assessmentId}` : "/action-plans";
    return cachedGet<ActionPlanItem[]>(url, undefined, { forceRefresh, ttlMs: 60000 });
  },
  create: async (assessmentId: number, data: Partial<ActionPlanItem>) => {
    const res = await apiClient.post(`/action-plans?assessment_id=${assessmentId}`, data);
    clearApiCache("/action-plans");
    return res.data.data as ActionPlanItem;
  },
  update: async (actionId: number, data: Partial<ActionPlanItem>) => {
    const res = await apiClient.put(`/action-plans/${actionId}`, data);
    clearApiCache("/action-plans");
    return res.data.data as ActionPlanItem;
  },
  delete: async (actionId: number) => {
    const res = await apiClient.delete(`/action-plans/${actionId}`);
    clearApiCache("/action-plans");
    return res.data;
  },
};

export const dashboardApi = {
  getSummary: async (assessmentId?: number, forceRefresh = false) => {
    const url = assessmentId ? `/dashboard/summary?assessment_id=${assessmentId}` : "/dashboard/summary";
    return cachedGet<DashboardSummary>(url, undefined, { forceRefresh, ttlMs: 90000 });
  },
};

export const reportApi = {
  getReport: async (assessmentId: number, forceRefresh = false) => {
    return cachedGet(`/reports/${assessmentId}`, undefined, { forceRefresh, ttlMs: 120000 });
  },
  getPdfDownloadUrl: (assessmentId: number) => {
    return `${API_BASE_URL}/reports/${assessmentId}/pdf`;
  },
};

export const assistantApi = {
  chat: async (
    assessmentId: number | undefined,
    message: string,
    history?: { role: string; content: string }[]
  ) => {
    const res = await apiClient.post("/assistant/chat", {
      assessment_id: assessmentId,
      message,
      history,
    });
    return res.data.data;
  },
};

export const adminApi = {
  getUsers: async (forceRefresh = false) => {
    return cachedGet<AdminUserItem[]>("/admin/users", undefined, { forceRefresh, ttlMs: 60000 });
  },
  createUser: async (userData: any) => {
    const res = await apiClient.post("/admin/users", userData);
    clearApiCache("/admin/users");
    return res.data;
  },
  updateUserRole: async (userId: number, role: string) => {
    const res = await apiClient.put(`/admin/users/${userId}/role`, { role });
    clearApiCache("/admin/users");
    return res.data;
  },
  updateUserStatus: async (userId: number, isActive: boolean) => {
    const res = await apiClient.put(`/admin/users/${userId}/status`, { is_active: isActive });
    clearApiCache("/admin/users");
    return res.data;
  },
  getIndustries: async (forceRefresh = false) => {
    return cachedGet<any[]>("/admin/industries", undefined, { forceRefresh, ttlMs: 60000 });
  },
  assignConsultant: async (consultantId: number, industryId: number) => {
    const res = await apiClient.post("/admin/industries/assign-consultant", {
      consultant_id: consultantId,
      industry_id: industryId,
    });
    clearApiCache("/admin/industries");
    return res.data;
  },
  getEmissionFactors: async (forceRefresh = false) => {
    return cachedGet<EmissionFactorItem[]>("/admin/emission-factors", undefined, { forceRefresh, ttlMs: 60000 });
  },
  createEmissionFactor: async (factorData: any) => {
    const res = await apiClient.post("/admin/emission-factors", factorData);
    clearApiCache("/admin/emission-factors");
    return res.data;
  },
  updateEmissionFactor: async (factorId: number, factorData: any) => {
    const res = await apiClient.put(`/admin/emission-factors/${factorId}`, factorData);
    clearApiCache("/admin/emission-factors");
    return res.data;
  },
  getRecommendationKnowledge: async (forceRefresh = false) => {
    return cachedGet<RecommendationKnowledgeItem[]>("/admin/recommendation-knowledge", undefined, { forceRefresh, ttlMs: 60000 });
  },
  createRecommendationKnowledge: async (knowledgeData: any) => {
    const res = await apiClient.post("/admin/recommendation-knowledge", knowledgeData);
    clearApiCache("/admin/recommendation-knowledge");
    return res.data;
  },
  getAuditLogs: async (actionFilter?: string, forceRefresh = false) => {
    const url = actionFilter ? `/admin/audit-logs?action=${actionFilter}` : "/admin/audit-logs";
    return cachedGet<AuditLogItem[]>(url, undefined, { forceRefresh, ttlMs: 30000 });
  },
};

export default apiClient;
