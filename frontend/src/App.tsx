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

import { dashboardApi } from "./services/api";

const Layout: React.FC<{
  children: React.ReactNode;
  activeAssessmentId?: number;
  factoryName: string;
  industryType: string;
}> = ({ children, activeAssessmentId, factoryName, industryType }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const location = useLocation();
  const { isReadOnly } = useAuth();

  const isPublic = ["/", "/login", "/register", "/unauthorized", "/forbidden", "/404"].includes(location.pathname);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex flex-col selection:bg-carbon-green selection:text-industrial-950">
      <Navbar
        onOpenAssistant={() => !isReadOnly && setIsAssistantOpen(true)}
        factoryName={factoryName}
        industryType={industryType}
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
  handleAssessmentSelected,
}: {
  activeAssessmentId?: number;
  handleAssessmentSelected: (id: number) => void;
}) {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
              <AssessmentWizardPage onAssessmentCreated={handleAssessmentSelected} />
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
              <HistoryPage onSelectAssessment={handleAssessmentSelected} />
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

export function App() {
  const [activeAssessmentId, setActiveAssessmentId] = useState<number | undefined>(() => {
    const saved = localStorage.getItem("carbon_active_assessment");
    return saved ? parseInt(saved) : undefined;
  });

  const [factoryName, setFactoryName] = useState<string>("My Industrial Facility");
  const [industryType, setIndustryType] = useState<string>("Manufacturing");

  const refreshTelemetry = async (assessmentIdToFetch?: number) => {
    try {
      const summary = await dashboardApi.getSummary(assessmentIdToFetch || activeAssessmentId);
      if (summary.assessment_id) {
        setActiveAssessmentId(summary.assessment_id);
        localStorage.setItem("carbon_active_assessment", summary.assessment_id.toString());
      }
      if (summary.factory_name) setFactoryName(summary.factory_name);
      if (summary.industry_type) setIndustryType(summary.industry_type);
    } catch (err) {
      // User may not have created an assessment yet
    }
  };

  useEffect(() => {
    refreshTelemetry();
  }, []);

  const handleAssessmentSelected = (newAssessmentId: number) => {
    setActiveAssessmentId(newAssessmentId);
    localStorage.setItem("carbon_active_assessment", newAssessmentId.toString());
    refreshTelemetry(newAssessmentId);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout
          activeAssessmentId={activeAssessmentId}
          factoryName={factoryName}
          industryType={industryType}
        >
          <AppRoutes
            activeAssessmentId={activeAssessmentId}
            handleAssessmentSelected={handleAssessmentSelected}
          />
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
