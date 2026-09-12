import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { AiAssistantModal } from "./components/AiAssistantModal";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AssessmentWizardPage } from "./pages/AssessmentWizardPage";
import { HotspotsPage } from "./pages/HotspotsPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { SimulatorPage } from "./pages/SimulatorPage";
import { ScenarioComparisonPage } from "./pages/ScenarioComparisonPage";
import { ActionPlanPage } from "./pages/ActionPlanPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { HistoryPage } from "./pages/HistoryPage";

// Admin & Governance Pages
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { EmissionFactorsPage } from "./pages/EmissionFactorsPage";
import { RecommendationKnowledgePage } from "./pages/RecommendationKnowledgePage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminIndustriesPage } from "./pages/AdminIndustriesPage";

// Error Pages
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { ForbiddenPage } from "./pages/ForbiddenPage";
import { NotFoundPage } from "./pages/NotFoundPage";

import { dashboardApi, analysisApi, simulatorApi, actionPlanApi, reportApi, industryApi, assessmentApi, clearAssessmentCache } from "./services/api";

const Layout: React.FC<{
  children: React.ReactNode;
  activeAssessmentId?: number;
  factoryName: string;
  industryType: string;
  onSelectFactory?: (factoryId: number, factoryName: string, sector: string) => void;
}> = ({ children, activeAssessmentId, factoryName, industryType, onSelectFactory }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const location = useLocation();
  const { isReadOnly } = useAuth();

  const isPublic = ["/", "/login", "/register", "/forgot-password", "/unauthorized", "/forbidden", "/404"].includes(location.pathname);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex flex-col selection:bg-carbon-green selection:text-industrial-950">
      <Navbar
        onOpenAssistant={() => !isReadOnly && setIsAssistantOpen(true)}
        factoryName={factoryName}
        industryType={industryType}
        onSelectFactory={onSelectFactory}
      />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
      {!isReadOnly && (
        <AiAssistantModal
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          assessmentId={activeAssessmentId}
          factoryName={factoryName}
        />
      )}
    </div>
  );
};

function AppRoutes({
  activeAssessmentId,
  activeFactoryId,
  activeFactoryName,
  handleAssessmentSelected,
}: {
  activeAssessmentId?: number;
  activeFactoryId?: number;
  activeFactoryName?: string;
  handleAssessmentSelected: (id: number) => void;
}) {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      {/* Protected Core Platform Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleGuard>
              <DashboardPage
                activeAssessmentId={activeAssessmentId}
                activeFactoryId={activeFactoryId}
                activeFactoryName={activeFactoryName}
                onSelectAssessment={handleAssessmentSelected}
              />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessment/new"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "ADMIN"]}>
              <AssessmentWizardPage
                activeFactoryId={activeFactoryId}
                activeFactoryName={activeFactoryName}
                onAssessmentCreated={handleAssessmentSelected}
              />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hotspots"
        element={
          <ProtectedRoute>
            <RoleGuard>
              <HotspotsPage activeAssessmentId={activeAssessmentId} />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <RoleGuard>
              <RecommendationsPage activeAssessmentId={activeAssessmentId} />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/simulator"
        element={
          <ProtectedRoute>
            <RoleGuard>
              <SimulatorPage activeAssessmentId={activeAssessmentId} />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/scenarios"
        element={
          <ProtectedRoute>
            <RoleGuard>
              <ScenarioComparisonPage activeAssessmentId={activeAssessmentId} />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/action-plan"
        element={
          <ProtectedRoute>
            <RoleGuard>
              <ActionPlanPage activeAssessmentId={activeAssessmentId} />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <RoleGuard>
              <ReportsPage activeAssessmentId={activeAssessmentId} />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <RoleGuard>
              <ProfilePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <RoleGuard>
              <HistoryPage
                activeFactoryId={activeFactoryId}
                activeFactoryName={activeFactoryName}
                onSelectAssessment={handleAssessmentSelected}
              />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Audit Trail (Admin & Regulator only) */}
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["ADMIN", "REGULATOR_AUDITOR"]}>
              <AuditLogsPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Admin Panel Routes */}
      <Route path="/admin" element={<Navigate to="/admin/users" replace />} />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["ADMIN"]}>
              <AdminUsersPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/industries"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["ADMIN", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR"]}>
              <AdminIndustriesPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/emission-factors"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["ADMIN", "REGULATOR_AUDITOR"]}>
              <EmissionFactorsPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/recommendation-knowledge"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["ADMIN", "REGULATOR_AUDITOR"]}>
              <RecommendationKnowledgePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function MainApp() {
  const { isAuthenticated, token, user } = useAuth();
  const [activeAssessmentId, setActiveAssessmentId] = useState<number | undefined>(() => {
    const saved = localStorage.getItem("carbon_active_assessment");
    return saved ? parseInt(saved) : undefined;
  });
  const [activeFactoryId, setActiveFactoryId] = useState<number | undefined>(() => {
    const saved = localStorage.getItem("carbon_active_factory_id");
    return saved ? parseInt(saved) : undefined;
  });

  const [factoryName, setFactoryName] = useState<string>(() => {
    return localStorage.getItem("carbon_active_factory_name") || "";
  });
  const [industryType, setIndustryType] = useState<string>(() => {
    return localStorage.getItem("carbon_active_factory_sector") || "";
  });

  const prefetchCoreData = (assessmentId: number) => {
    // Non-blocking background prefetch for instantaneous 0ms page navigation
    Promise.allSettled([
      analysisApi.getHotspots(assessmentId),
      analysisApi.getRecommendations(assessmentId),
      simulatorApi.getScenarios(assessmentId),
      actionPlanApi.list(assessmentId),
      reportApi.getReport(assessmentId),
    ]).catch(() => {});
  };

  const refreshTelemetry = async (assessmentIdToFetch?: number, factoryIdToFetch?: number) => {
    let resolvedFactory = "";
    let resolvedSector = "";
    const targetAssessment = assessmentIdToFetch !== undefined ? assessmentIdToFetch : activeAssessmentId;
    const targetFactory = factoryIdToFetch !== undefined ? factoryIdToFetch : activeFactoryId;

    try {
      const summary = await dashboardApi.getSummary(targetAssessment, targetFactory, true);
      if (summary.assessment_id) {
        setActiveAssessmentId(summary.assessment_id);
        localStorage.setItem("carbon_active_assessment", summary.assessment_id.toString());
        prefetchCoreData(summary.assessment_id);
      } else if (targetFactory) {
        // Selected factory has no audit yet
        setActiveAssessmentId(undefined);
        localStorage.removeItem("carbon_active_assessment");
      }
      if (summary.factory_name) resolvedFactory = summary.factory_name;
      if (summary.industry_type) resolvedSector = summary.industry_type;
      if (summary.factory_id && !targetFactory) {
        setActiveFactoryId(summary.factory_id);
        localStorage.setItem("carbon_active_factory_id", summary.factory_id.toString());
      }
    } catch (err) {
      // User may not have created an assessment yet
    }

    // Only fallback to user profile if no factory was resolved from active assessment
    if (!resolvedFactory) {
      try {
        const ind = await industryApi.getProfile();
        if (ind && ind.company_name) {
          resolvedFactory = ind.company_name;
          resolvedSector = ind.industry_type || "";
          if (!activeFactoryId && ind.id) {
            setActiveFactoryId(ind.id);
            localStorage.setItem("carbon_active_factory_id", ind.id.toString());
          }
        }
      } catch (e) {}
    }

    if (resolvedFactory) {
      setFactoryName(resolvedFactory);
      localStorage.setItem("carbon_active_factory_name", resolvedFactory);
    }
    if (resolvedSector) {
      setIndustryType(resolvedSector);
      localStorage.setItem("carbon_active_factory_sector", resolvedSector);
    }
  };

  useEffect(() => {
    if (token) {
      refreshTelemetry();
      if (activeAssessmentId) {
        prefetchCoreData(activeAssessmentId);
      }
    } else {
      setActiveAssessmentId(undefined);
      setActiveFactoryId(undefined);
      setFactoryName("");
      setIndustryType("");
      localStorage.removeItem("carbon_active_factory_name");
      localStorage.removeItem("carbon_active_factory_sector");
      localStorage.removeItem("carbon_active_factory_id");
    }
  }, [token, isAuthenticated, user?.id]);

  const handleAssessmentSelected = (newAssessmentId: number) => {
    setActiveAssessmentId(newAssessmentId);
    localStorage.setItem("carbon_active_assessment", newAssessmentId.toString());
    refreshTelemetry(newAssessmentId, activeFactoryId);
  };

  const handleFactorySelected = async (factoryId: number, name: string, sector: string) => {
    // 1. Immediately update UI state for instant visual feedback
    setActiveFactoryId(factoryId);
    localStorage.setItem("carbon_active_factory_id", factoryId.toString());
    setFactoryName(name);
    localStorage.setItem("carbon_active_factory_name", name);
    setIndustryType(sector);
    localStorage.setItem("carbon_active_factory_sector", sector);

    // 2. Flush stale assessment-specific cache from previous factory
    clearAssessmentCache();

    // 3. Fetch assessments + dashboard summary IN PARALLEL for speed
    try {
      const [factoryAssessments, dashSummary] = await Promise.all([
        assessmentApi.list(true, factoryId),
        dashboardApi.getSummary(undefined, factoryId, true).catch(() => null),
      ]);

      let resolvedAssessmentId: number | undefined;

      if (factoryAssessments && factoryAssessments.length > 0) {
        resolvedAssessmentId = factoryAssessments[0].id;
      }
      // Also check if dashboard summary returned an assessment_id
      if (!resolvedAssessmentId && dashSummary?.assessment_id) {
        resolvedAssessmentId = dashSummary.assessment_id;
      }

      if (resolvedAssessmentId) {
        setActiveAssessmentId(resolvedAssessmentId);
        localStorage.setItem("carbon_active_assessment", resolvedAssessmentId.toString());
        // 4. Fire-and-forget: prefetch ALL page data in parallel
        //    Pages will reuse these cached responses via deduplication
        prefetchCoreData(resolvedAssessmentId);
      } else {
        setActiveAssessmentId(undefined);
        localStorage.removeItem("carbon_active_assessment");
      }
    } catch (e) {
      console.error("Failed to switch factory assessment", e);
    }
  };

  return (
    <BrowserRouter>
      <Layout
        activeAssessmentId={activeAssessmentId}
        factoryName={factoryName}
        industryType={industryType}
        onSelectFactory={handleFactorySelected}
      >
        <AppRoutes
          activeAssessmentId={activeAssessmentId}
          activeFactoryId={activeFactoryId}
          activeFactoryName={factoryName}
          handleAssessmentSelected={handleAssessmentSelected}
        />
      </Layout>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
