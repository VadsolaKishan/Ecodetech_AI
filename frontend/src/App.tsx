import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { DemoBanner } from "./components/DemoBanner";
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
import { dashboardApi } from "./services/api";

const Layout: React.FC<{
  children: React.ReactNode;
  activeAssessmentId?: number;
  onFactoryLoaded: (id: number) => void;
  factoryName: string;
  industryType: string;
}> = ({ children, activeAssessmentId, onFactoryLoaded, factoryName, industryType }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const location = useLocation();

  const isPublic = ["/", "/login", "/register"].includes(location.pathname);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex flex-col selection:bg-carbon-green selection:text-industrial-950">
      <DemoBanner onFactoryLoaded={onFactoryLoaded} activeFactoryName={factoryName} />
      <Navbar
        onOpenAssistant={() => setIsAssistantOpen(true)}
        factoryName={factoryName}
        industryType={industryType}
      />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
      <AiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        assessmentId={activeAssessmentId}
        factoryName={factoryName}
      />
    </div>
  );
};

export function App() {
  const [activeAssessmentId, setActiveAssessmentId] = useState<number | undefined>(() => {
    const saved = localStorage.getItem("carbon_active_assessment");
    return saved ? parseInt(saved) : undefined;
  });

  const [factoryName, setFactoryName] = useState<string>("Surat Eco-Weave Textiles");
  const [industryType, setIndustryType] = useState<string>("Textile");

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
      console.error("Telemetry refresh failed", err);
    }
  };

  useEffect(() => {
    refreshTelemetry();
  }, []);

  const handleFactoryLoaded = (newAssessmentId: number) => {
    setActiveAssessmentId(newAssessmentId);
    localStorage.setItem("carbon_active_assessment", newAssessmentId.toString());
    refreshTelemetry(newAssessmentId);
  };

  return (
    <BrowserRouter>
      <Layout
        activeAssessmentId={activeAssessmentId}
        onFactoryLoaded={handleFactoryLoaded}
        factoryName={factoryName}
        industryType={industryType}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Core Platform Routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                activeAssessmentId={activeAssessmentId}
                onSelectAssessment={handleFactoryLoaded}
              />
            }
          />
          <Route
            path="/assessment/new"
            element={<AssessmentWizardPage onAssessmentCreated={handleFactoryLoaded} />}
          />
          <Route
            path="/hotspots"
            element={<HotspotsPage activeAssessmentId={activeAssessmentId} />}
          />
          <Route
            path="/recommendations"
            element={<RecommendationsPage activeAssessmentId={activeAssessmentId} />}
          />
          <Route
            path="/simulator"
            element={<SimulatorPage activeAssessmentId={activeAssessmentId} />}
          />
          <Route
            path="/scenarios"
            element={<ScenarioComparisonPage activeAssessmentId={activeAssessmentId} />}
          />
          <Route
            path="/action-plan"
            element={<ActionPlanPage activeAssessmentId={activeAssessmentId} />}
          />
          <Route
            path="/reports"
            element={<ReportsPage activeAssessmentId={activeAssessmentId} />}
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/history"
            element={<HistoryPage onSelectAssessment={handleFactoryLoaded} />}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
