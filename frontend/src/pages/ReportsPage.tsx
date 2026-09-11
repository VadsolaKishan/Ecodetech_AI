import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  Building, 
  ShieldCheck, 
  Flame, 
  Lightbulb, 
  CheckSquare, 
  Info,
  Calendar
} from "lucide-react";
import { reportApi, dashboardApi } from "../services/api";

interface ReportsPageProps {
  activeAssessmentId?: number;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ activeAssessmentId }) => {
  const [assessmentId, setAssessmentId] = useState<number | null>(() => {
    return activeAssessmentId || parseInt(localStorage.getItem("carbon_active_assessment") || "1");
  });
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      if (!report) {
        setLoading(true);
      }
      const targetId = assessmentId || activeAssessmentId || parseInt(localStorage.getItem("carbon_active_assessment") || "1");
      const data = await reportApi.getReport(targetId);
      if (data) {
        setReport(data);
      }
    } catch (err) {
      console.error("Failed to load report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAssessmentId && activeAssessmentId !== assessmentId) {
      setAssessmentId(activeAssessmentId);
    }
    fetchReport();
  }, [assessmentId, activeAssessmentId]);

  const handleDownloadPdf = () => {
    const targetId = assessmentId || activeAssessmentId || 1;
    window.open(reportApi.getPdfDownloadUrl(targetId), "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !report) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-carbon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-industrial-400">Compiling executive audit report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 p-8 text-center py-20 text-industrial-400">
        No active assessment report data found.
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-5xl mx-auto text-white print:bg-white print:text-black print:p-0">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-carbon-green mb-1">
            <FileText className="w-4 h-4" />
            <span>Audit-Ready Documentation • ISO 14064 & GHG Protocol Standard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Carbon Intelligence Report</h1>
          <p className="text-xs text-industrial-400 mt-1">
            Generated for {report.company.name} • Audit Period: {report.generated_at}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-industrial-800 hover:bg-industrial-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold flex items-center space-x-1.5 transition-all shadow-glow-green"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="p-8 rounded-2xl bg-industrial-900 border border-industrial-800 shadow-card-dark space-y-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Report Title & Metadata Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-industrial-800 print:border-gray-200">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono text-carbon-green print:text-emerald-700 font-bold uppercase">
                CARBONCOPILOT AI
              </span>
              <span className="text-xs text-industrial-400 print:text-gray-500">• Official Verification Report</span>
            </div>
            <h2 className="text-xl font-bold text-white print:text-black">{report.title}</h2>
            <p className="text-xs text-industrial-400 print:text-gray-600 mt-1">
              Facility: {report.company.name} ({report.company.industry_type}) | Location: {report.company.location}
            </p>
          </div>

          <div className="text-right text-xs font-mono text-industrial-400 print:text-gray-600 space-y-0.5">
            <div>Audit Date: {report.generated_at}</div>
            <div>Confidence: <span className="text-carbon-green font-bold">{report.kpis.confidence_level}</span></div>
            <div>Circularity Index: <span className="text-carbon-cyber font-bold">{report.kpis.circularity_score}/100</span></div>
          </div>
        </div>

        {/* Executive KPI Summary Cards */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-industrial-400 print:text-gray-700 mb-3">
            1. Emissions Profile & Decarbonization Targets
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-industrial-950/70 print:bg-gray-50 rounded-xl border border-industrial-800 print:border-gray-200">
              <span className="text-industrial-400 print:text-gray-500 block text-[10px]">Total Emissions</span>
              <span className="text-base font-bold text-white print:text-black">{report.kpis.total_emissions_tco2e} tCO₂e</span>
            </div>
            <div className="p-3 bg-industrial-950/70 print:bg-gray-50 rounded-xl border border-industrial-800 print:border-gray-200">
              <span className="text-industrial-400 print:text-gray-500 block text-[10px]">Scope 1 Direct</span>
              <span className="text-base font-bold text-white print:text-black">{report.kpis.scope1_tco2e} tCO₂e</span>
            </div>
            <div className="p-3 bg-industrial-950/70 print:bg-gray-50 rounded-xl border border-industrial-800 print:border-gray-200">
              <span className="text-industrial-400 print:text-gray-500 block text-[10px]">Scope 2 Electricity</span>
              <span className="text-base font-bold text-white print:text-black">{report.kpis.scope2_tco2e} tCO₂e</span>
            </div>
            <div className="p-3 bg-industrial-950/70 print:bg-gray-50 rounded-xl border border-industrial-800 print:border-gray-200">
              <span className="text-industrial-400 print:text-gray-500 block text-[10px]">Scope 3 Supply Chain</span>
              <span className="text-base font-bold text-white print:text-black">{report.kpis.scope3_tco2e} tCO₂e</span>
            </div>
          </div>
        </div>

        {/* Hotspots Section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-industrial-400 print:text-gray-700 mb-3 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-carbon-critical" />
            <span>2. Detected Emission Hotspots & Leak Points</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-industrial-800 print:border-gray-300 text-industrial-400 print:text-gray-600 text-[11px]">
                  <th className="py-2">Hotspot Source</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Emissions (kg CO₂e)</th>
                  <th className="py-2">% Total</th>
                  <th className="py-2">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-850 print:divide-gray-200">
                {report.hotspots.map((h: any, i: number) => (
                  <tr key={i} className="text-industrial-200 print:text-gray-800">
                    <td className="py-2.5 font-semibold text-white print:text-black">{h.source}</td>
                    <td className="py-2.5">{h.category}</td>
                    <td className="py-2.5">{h.emissions_kg?.toLocaleString()}</td>
                    <td className="py-2.5 text-carbon-green font-bold">{h.percentage}%</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        h.severity === "Critical" ? "bg-red-500/20 text-red-400 print:text-red-700" : "text-amber-400 print:text-amber-700"
                      }`}>
                        {h.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Circular Recommendations Section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-industrial-400 print:text-gray-700 mb-3 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-carbon-lime" />
            <span>3. High-Leverage Circular Interventions & ROI</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-industrial-800 print:border-gray-300 text-industrial-400 print:text-gray-600 text-[11px]">
                  <th className="py-2">Intervention</th>
                  <th className="py-2">Avoided CO₂</th>
                  <th className="py-2">CAPEX (₹)</th>
                  <th className="py-2">Savings / Yr</th>
                  <th className="py-2">Payback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-850 print:divide-gray-200">
                {report.recommendations.map((r: any, i: number) => (
                  <tr key={i} className="text-industrial-200 print:text-gray-800">
                    <td className="py-2.5 font-semibold text-white print:text-black">{r.title}</td>
                    <td className="py-2.5 text-carbon-green font-bold">
                      {r.co2_cut_kg?.toLocaleString()} kg ({r.reduction_pct}%)
                    </td>
                    <td className="py-2.5">₹{(r.capex_inr / 100000).toFixed(1)}L</td>
                    <td className="py-2.5 text-carbon-lime font-bold">₹{(r.savings_inr / 100000).toFixed(1)}L</td>
                    <td className="py-2.5 font-semibold text-white print:text-black">{r.payback_months} mos</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Plan Roadmap Status */}
        {report.action_plans && report.action_plans.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-industrial-400 print:text-gray-700 mb-3 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-carbon-cyber" />
              <span>4. Operational Action Roadmap</span>
            </h3>
            <div className="space-y-2">
              {report.action_plans.map((a: any, i: number) => (
                <div
                  key={i}
                  className="p-3 bg-industrial-950/60 print:bg-gray-50 rounded-xl border border-industrial-800 print:border-gray-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white print:text-black">{a.title}</span>
                    <span className="text-industrial-400 print:text-gray-600 block text-[11px]">
                      Owner: {a.owner} • Target: {a.deadline}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    a.status === "Completed"
                      ? "bg-carbon-green/20 text-carbon-green print:text-emerald-700"
                      : "bg-amber-500/20 text-amber-300 print:text-amber-700"
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Disclaimer */}
        <div className="p-4 rounded-xl bg-industrial-950/90 print:bg-gray-100 border border-industrial-800 print:border-gray-300 text-[11px] leading-relaxed text-industrial-400 print:text-gray-600">
          <div className="flex items-center space-x-1.5 font-bold text-white print:text-black mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-carbon-green" />
            <span>Regulatory & Data Verification Note</span>
          </div>
          {report.disclaimer}
        </div>
      </div>
    </div>
  );
};
