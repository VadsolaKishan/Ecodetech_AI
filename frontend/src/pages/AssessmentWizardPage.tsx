import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Boxes,
  Trash2,
  Truck,
  Factory,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash,
  ScanLine
} from "lucide-react";
import { assessmentApi } from "../services/api";
import { BillOcrModal, SuggestedItem } from "../components/BillOcrModal";

interface AssessmentWizardPageProps {
  onAssessmentCreated: (id: number) => void;
  activeFactoryId?: number;
  activeFactoryName?: string;
}

export const AssessmentWizardPage: React.FC<AssessmentWizardPageProps> = ({
  onAssessmentCreated,
  activeFactoryId,
  activeFactoryName,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Form State
  const [assessmentName, setAssessmentName] = useState(
    activeFactoryName ? `${activeFactoryName} - Carbon Audit 2026` : "Facility Carbon Audit 2026"
  );
  const [monthlyProduction, setMonthlyProduction] = useState(120);
  const [productionUnit, setProductionUnit] = useState("tonnes fabric");

  // Snap & Ingest (AI OCR) State
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [ocrNotice, setOcrNotice] = useState<string | null>(null);

  // Step 1: Energy Inputs
  const [energyInputs, setEnergyInputs] = useState<Array<{
    source_type: string;
    quantity: number;
    unit: string;
    renewable_percentage: number;
    is_ocr_filled?: boolean;
  }>>([
    { source_type: "grid_electricity", quantity: 125000, unit: "kWh", renewable_percentage: 0 },
    { source_type: "coal", quantity: 28, unit: "tonne", renewable_percentage: 0 },
    { source_type: "diesel", quantity: 1500, unit: "litre", renewable_percentage: 0 },
  ]);

  // Step 2: Material Inputs
  const [materialInputs, setMaterialInputs] = useState<Array<{
    material_name: string;
    material_type: string;
    quantity: number;
    unit: string;
    virgin_percentage: number;
    recycled_percentage: number;
    supplier_distance_km: number;
    is_ocr_filled?: boolean;
  }>>([
    { material_name: "Polyester Filament Yarn", material_type: "Textiles/Fibers", quantity: 50, unit: "tonne", virgin_percentage: 90, recycled_percentage: 10, supplier_distance_km: 150 },
    { material_name: "Raw Carded Cotton", material_type: "Textiles/Fibers", quantity: 30, unit: "tonne", virgin_percentage: 85, recycled_percentage: 15, supplier_distance_km: 220 },
  ]);

  const handleApplyOcrInputs = (items: SuggestedItem[], summaryMsg: string) => {
    let energyUpdated = false;
    let materialUpdated = false;

    items.forEach((item) => {
      if (item.target_step === "energy") {
        setEnergyInputs((prev) => {
          const existingIdx = prev.findIndex((e) => e.source_type === item.source_type);
          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: item.quantity,
              unit: item.unit || updated[existingIdx].unit,
              renewable_percentage: item.renewable_percentage ?? updated[existingIdx].renewable_percentage,
              is_ocr_filled: true,
            };
            return updated;
          } else {
            return [
              ...prev,
              {
                source_type: item.source_type || "grid_electricity",
                quantity: item.quantity,
                unit: item.unit || "kWh",
                renewable_percentage: item.renewable_percentage || 0,
                is_ocr_filled: true,
              },
            ];
          }
        });
        energyUpdated = true;
      } else if (item.target_step === "material") {
        setMaterialInputs((prev) => [
          ...prev,
          {
            material_name: item.material_name || "Extracted Material",
            material_type: item.material_type || "Textiles/Fibers",
            quantity: item.quantity || 10,
            unit: item.unit || "tonne",
            virgin_percentage: item.virgin_percentage ?? (100 - (item.recycled_percentage || 0)),
            recycled_percentage: item.recycled_percentage || 0,
            supplier_distance_km: item.supplier_distance_km || 100,
            is_ocr_filled: true,
          },
        ]);
        materialUpdated = true;
      }
    });

    setOcrNotice(summaryMsg || "Successfully auto-filled inputs from document via Gemini Vision!");
    if (energyUpdated) {
      setCurrentStep(1);
    } else if (materialUpdated) {
      setCurrentStep(2);
    }
  };

  // Step 3: Waste Inputs
  const [wasteInputs, setWasteInputs] = useState([
    { waste_type: "Process Fabric Scraps", quantity: 10, unit: "tonne", disposal_method: "landfill", recyclable_percentage: 25 },
    { waste_type: "Boiler Fly Ash", quantity: 3.5, unit: "tonne", disposal_method: "landfill", recyclable_percentage: 0 },
  ]);

  // Step 4: Transport Inputs
  const [transportInputs, setTransportInputs] = useState([
    { transport_mode: "heavy_truck", distance_km: 380, weight_tonnes: 40, frequency_per_month: 3 },
  ]);

  const addEnergyRow = () => {
    setEnergyInputs([...energyInputs, { source_type: "grid_electricity", quantity: 5000, unit: "kWh", renewable_percentage: 0 }]);
  };

  const removeEnergyRow = (index: number) => {
    setEnergyInputs(energyInputs.filter((_, i) => i !== index));
  };

  const addMaterialRow = () => {
    setMaterialInputs([...materialInputs, { material_name: "Polymer Pellets", material_type: "Plastics/Polymers", quantity: 10, unit: "tonne", virgin_percentage: 100, recycled_percentage: 0, supplier_distance_km: 100 }]);
  };

  const removeMaterialRow = (index: number) => {
    setMaterialInputs(materialInputs.filter((_, i) => i !== index));
  };

  const addWasteRow = () => {
    setWasteInputs([...wasteInputs, { waste_type: "Packaging Plastic", quantity: 2, unit: "tonne", disposal_method: "landfill", recyclable_percentage: 30 }]);
  };

  const removeWasteRow = (index: number) => {
    setWasteInputs(wasteInputs.filter((_, i) => i !== index));
  };

  const addTransportRow = () => {
    setTransportInputs([...transportInputs, { transport_mode: "medium_truck", distance_km: 150, weight_tonnes: 15, frequency_per_month: 2 }]);
  };

  const removeTransportRow = (index: number) => {
    setTransportInputs(transportInputs.filter((_, i) => i !== index));
  };

  const steps = [
    { num: 1, title: "Energy", icon: Zap },
    { num: 2, title: "Materials", icon: Boxes },
    { num: 3, title: "Waste Streams", icon: Trash2 },
    { num: 4, title: "Transport", icon: Truck },
    { num: 5, title: "Production", icon: Factory },
    { num: 6, title: "Review & AI Analysis", icon: Sparkles },
  ];

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    // Animated sequence for hackathon wow factor
    const stepsLabels = [
      "Processing energy inputs...",
      "Analyzing material carbon intensity...",
      "Mapping waste disposal streams...",
      "Detecting emission hotspots via Isolation Forest...",
      "Matching circular alternative knowledge base...",
      "Synthesizing CAPEX, savings & payback models..."
    ];

    for (let i = 0; i < stepsLabels.length; i++) {
      setAnalysisStep(i);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    try {
      const payload = {
        name: assessmentName,
        industry_id: activeFactoryId,
        assessment_period: "Monthly Operational Audit",
        monthly_production: monthlyProduction,
        production_unit: productionUnit,
        energy_inputs: energyInputs.map(({ is_ocr_filled: _, ...rest }) => rest),
        material_inputs: materialInputs.map(({ is_ocr_filled: _, ...rest }) => rest),
        waste_inputs: wasteInputs,
        transport_inputs: transportInputs,
      };

      const result = await assessmentApi.create(payload);
      if (result && result.id) {
        onAssessmentCreated(result.id);
        navigate("/hotspots");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Failed to run assessment", err);
      alert(err.response?.data?.detail || "Failed to run carbon assessment. Please verify your inputs.");
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto text-white">
      {/* Stepper Header */}
      <div className="mb-8">
        {activeFactoryName && (
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-carbon-green/15 border border-carbon-green/40 text-carbon-green text-xs font-mono font-semibold">
            <Factory className="w-3.5 h-3.5" />
            <span>Target Facility: <strong>{activeFactoryName}</strong></span>
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight mb-2">Industrial Carbon Assessment Wizard</h1>
        <p className="text-xs text-industrial-400">
          Enter your facility's monthly resource consumption to pinpoint leak points and circular interventions.
        </p>

        {/* Stepper pills */}
        <div className="flex items-center justify-between mt-6 overflow-x-auto py-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                onClick={() => !analyzing && setCurrentStep(s.num)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                  isCurrent
                    ? "bg-carbon-green text-industrial-950 font-bold shadow-glow-green"
                    : isCompleted
                    ? "bg-industrial-800 text-carbon-green border border-carbon-green/40"
                    : "bg-industrial-900 text-industrial-400 border border-industrial-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs">{s.title}</span>
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-carbon-green" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Snap & Ingest Quick-Action Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-carbon-green/20 via-industrial-900 to-industrial-950 border border-carbon-green/40 shadow-lg shadow-carbon-green/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-carbon-green/20 border border-carbon-green/50 flex items-center justify-center text-carbon-green shadow-glow-green">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">⚡ AI Multimodal Ingest ("Snap & Assess")</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-carbon-green text-industrial-950">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-industrial-300 mt-0.5">
              Skip manual typing — upload an electricity bill, diesel slip or material invoice to auto-fill Scope 1 & 2 inputs in 3 seconds.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOcrModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-carbon-green text-industrial-950 font-bold text-xs hover:bg-carbon-green-hover shadow-glow-green transition flex items-center gap-1.5 flex-shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" /> Snap & Ingest Bill
        </button>
      </div>

      {/* Auto-filled Toast Alert */}
      {ocrNotice && (
        <div className="mb-6 p-3.5 rounded-xl bg-carbon-green/15 border border-carbon-green/50 text-xs text-carbon-green flex items-center justify-between animate-fade-in shadow-glow-green">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-carbon-green flex-shrink-0" />
            <span>{ocrNotice}</span>
          </div>
          <button onClick={() => setOcrNotice(null)} className="text-carbon-green hover:text-white text-xs underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Wizard Form Container */}
      <div className="p-6 rounded-2xl bg-industrial-900/90 border border-industrial-800 shadow-card-dark">
        {/* Step 1: Energy */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-industrial-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-carbon-amber" /> Step 1: Energy & Fuel Combustion
                </h3>
                <p className="text-xs text-industrial-400">
                  Electricity grid imports (Scope 2) and on-site fuel combustion (Scope 1).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOcrModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-carbon-green/15 hover:bg-carbon-green/25 text-xs text-carbon-green font-bold flex items-center gap-1.5 border border-carbon-green/40 shadow-glow-green/30 transition"
                >
                  <ScanLine className="w-3.5 h-3.5" /> Scan Bill / Receipt (OCR)
                </button>
                <button
                  type="button"
                  onClick={addEnergyRow}
                  className="px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-xs text-carbon-green font-medium flex items-center gap-1 border border-industrial-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Energy Source
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {energyInputs.map((e, idx) => (
                <div key={idx} className={`grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 rounded-xl border items-end relative transition-all ${
                  e.is_ocr_filled
                    ? "bg-carbon-green/10 border-carbon-green/40 shadow-glow-green/20"
                    : "bg-industrial-950/60 border-industrial-800"
                }`}>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-industrial-400">Source Type</label>
                      {e.is_ocr_filled && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-carbon-green/20 text-carbon-green border border-carbon-green/30">
                          ⚡ Auto-filled (Gemini OCR)
                        </span>
                      )}
                    </div>
                    <select
                      value={e.source_type}
                      onChange={(ev) => {
                        const updated = [...energyInputs];
                        updated[idx].source_type = ev.target.value;
                        setEnergyInputs(updated);
                      }}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="grid_electricity">Grid Electricity</option>
                      <option value="solar_onsite">On-site Solar</option>
                      <option value="coal">Thermal Coal (Boiler)</option>
                      <option value="diesel">Diesel (DG Gensets)</option>
                      <option value="natural_gas">Natural Gas (Piped PNG)</option>
                      <option value="lpg">LPG Commercial</option>
                      <option value="biomass">Agro-Biomass Briquettes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-industrial-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={e.quantity}
                      onChange={(ev) => {
                        const updated = [...energyInputs];
                        updated[idx].quantity = parseFloat(ev.target.value) || 0;
                        setEnergyInputs(updated);
                      }}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-industrial-400 mb-1">Unit</label>
                    <select
                      value={e.unit}
                      onChange={(ev) => {
                        const updated = [...energyInputs];
                        updated[idx].unit = ev.target.value;
                        setEnergyInputs(updated);
                      }}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="kWh">kWh</option>
                      <option value="MWh">MWh</option>
                      <option value="tonne">tonne</option>
                      <option value="kg">kg</option>
                      <option value="litre">litre</option>
                      <option value="m3">m³</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="w-full">
                      <label className="block text-[11px] text-industrial-400 mb-1">Renewable %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={e.renewable_percentage}
                        onChange={(ev) => {
                          const updated = [...energyInputs];
                          updated[idx].renewable_percentage = parseFloat(ev.target.value) || 0;
                          setEnergyInputs(updated);
                        }}
                        className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    {energyInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEnergyRow(idx)}
                        className="p-1.5 text-industrial-500 hover:text-carbon-critical mb-0.5"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Materials */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-industrial-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-carbon-cyber" /> Step 2: Raw Material Inputs
                </h3>
                <p className="text-xs text-industrial-400">
                  Purchased goods and feedstock (Scope 3 Category 1 - Embodied Carbon).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOcrModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-carbon-green/15 hover:bg-carbon-green/25 text-xs text-carbon-green font-bold flex items-center gap-1.5 border border-carbon-green/40 shadow-glow-green/30 transition"
                >
                  <ScanLine className="w-3.5 h-3.5" /> Scan Invoice (OCR)
                </button>
                <button
                  type="button"
                  onClick={addMaterialRow}
                  className="px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-xs text-carbon-green font-medium flex items-center gap-1 border border-industrial-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Material
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {materialInputs.map((m, idx) => (
                <div key={idx} className={`p-3 rounded-xl border space-y-3 transition-all ${
                  m.is_ocr_filled
                    ? "bg-carbon-green/10 border-carbon-green/40 shadow-glow-green/20"
                    : "bg-industrial-950/60 border-industrial-800"
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] text-industrial-400">Material Name</label>
                        {m.is_ocr_filled && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-carbon-green/20 text-carbon-green border border-carbon-green/30">
                            ⚡ Auto-filled (Gemini OCR)
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={m.material_name}
                        onChange={(ev) => {
                          const updated = [...materialInputs];
                          updated[idx].material_name = ev.target.value;
                          setMaterialInputs(updated);
                        }}
                        className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-industrial-400 mb-1">Category</label>
                      <select
                        value={m.material_type}
                        onChange={(ev) => {
                          const updated = [...materialInputs];
                          updated[idx].material_type = ev.target.value;
                          setMaterialInputs(updated);
                        }}
                        className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="Textiles/Fibers">Textiles / Fibers</option>
                        <option value="Plastics/Polymers">Plastics / Polymers</option>
                        <option value="Metals">Steel / Aluminum / Metals</option>
                        <option value="Paper/Cardboard">Paper / Packaging</option>
                        <option value="Chemicals">Industrial Chemicals</option>
                        <option value="Minerals/Aggregates">Cement / Aggregates</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-industrial-400 mb-1">Quantity (Tonnes)</label>
                      <input
                        type="number"
                        value={m.quantity}
                        onChange={(ev) => {
                          const updated = [...materialInputs];
                          updated[idx].quantity = parseFloat(ev.target.value) || 0;
                          setMaterialInputs(updated);
                        }}
                        className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-industrial-900 items-end">
                    <div>
                      <label className="block text-[11px] text-industrial-400 mb-1">Virgin Content %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={m.virgin_percentage}
                        onChange={(ev) => {
                          const updated = [...materialInputs];
                          const v = parseFloat(ev.target.value) || 0;
                          updated[idx].virgin_percentage = v;
                          updated[idx].recycled_percentage = Math.max(0, 100 - v);
                          setMaterialInputs(updated);
                        }}
                        className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-industrial-400 mb-1">Recycled Content %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={m.recycled_percentage}
                        onChange={(ev) => {
                          const updated = [...materialInputs];
                          const r = parseFloat(ev.target.value) || 0;
                          updated[idx].recycled_percentage = r;
                          updated[idx].virgin_percentage = Math.max(0, 100 - r);
                          setMaterialInputs(updated);
                        }}
                        className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-carbon-green"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-full">
                        <label className="block text-[11px] text-industrial-400 mb-1">Supplier Distance (km)</label>
                        <input
                          type="number"
                          value={m.supplier_distance_km}
                          onChange={(ev) => {
                            const updated = [...materialInputs];
                            updated[idx].supplier_distance_km = parseFloat(ev.target.value) || 0;
                            setMaterialInputs(updated);
                          }}
                          className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      {materialInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMaterialRow(idx)}
                          className="p-1.5 text-industrial-500 hover:text-carbon-critical ml-2"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Waste */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-industrial-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-carbon-critical" /> Step 3: Waste Generation & Disposal Streams
                </h3>
                <p className="text-xs text-industrial-400">
                  Landfill disposal, incineration, recycling diversion, or industrial byproduct reuse.
                </p>
              </div>
              <button
                type="button"
                onClick={addWasteRow}
                className="px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-xs text-carbon-green font-medium flex items-center gap-1 border border-industrial-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Waste Stream
              </button>
            </div>

            <div className="space-y-3">
              {wasteInputs.map((w, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-industrial-950/60 rounded-xl border border-industrial-800 items-end">
                  <div>
                    <label className="block text-[11px] text-industrial-400 mb-1">Waste Type</label>
                    <input
                      type="text"
                      value={w.waste_type}
                      onChange={(ev) => {
                        const updated = [...wasteInputs];
                        updated[idx].waste_type = ev.target.value;
                        setWasteInputs(updated);
                      }}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-industrial-400 mb-1">Quantity (Tonnes)</label>
                    <input
                      type="number"
                      value={w.quantity}
                      onChange={(ev) => {
                        const updated = [...wasteInputs];
                        updated[idx].quantity = parseFloat(ev.target.value) || 0;
                        setWasteInputs(updated);
                      }}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-industrial-400 mb-1">Disposal Method</label>
                    <select
                      value={w.disposal_method}
                      onChange={(ev) => {
                        const updated = [...wasteInputs];
                        updated[idx].disposal_method = ev.target.value;
                        setWasteInputs(updated);
                      }}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="landfill">Municipal / Industrial Landfill</option>
                      <option value="incineration">Incineration (No Energy Recovery)</option>
                      <option value="recycling">Authorized Recycling Facility</option>
                      <option value="composting">Composting / Anaerobic Digest</option>
                      <option value="byproduct_reuse">Industrial Symbiosis / Reuse</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="w-full">
                      <label className="block text-[11px] text-industrial-400 mb-1">Recyclable %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={w.recyclable_percentage}
                        onChange={(ev) => {
                          const updated = [...wasteInputs];
                          updated[idx].recyclable_percentage = parseFloat(ev.target.value) || 0;
                          setWasteInputs(updated);
                        }}
                        className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    {wasteInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWasteRow(idx)}
                        className="p-1.5 text-industrial-500 hover:text-carbon-critical"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Transport */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-industrial-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-carbon-green" /> Step 4: Freight Logistics & Distribution
                </h3>
                <p className="text-xs text-industrial-400">
                  Upstream and downstream transport mileage and vehicle types.
                </p>
              </div>
              <button
                type="button"
                onClick={addTransportRow}
                className="px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-xs text-carbon-green font-medium flex items-center gap-1 border border-industrial-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Freight Route
              </button>
            </div>

            <div className="space-y-3">
              {transportInputs.map((t, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-industrial-950/60 rounded-xl border border-industrial-800 items-end">
                  <div>
                    <label className="block text-[11px] text-industrial-400 mb-1">Vehicle Mode</label>
                    <select
                      value={t.transport_mode}
                      onChange={(ev) => {
                        const updated = [...transportInputs];
                        updated[idx].transport_mode = ev.target.value;
                        setTransportInputs(updated);
                      }}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="heavy_truck">Heavy Diesel Truck (&gt;20t)</option>
                      <option value="medium_truck">Medium Diesel Truck (7.5-20t)</option>
                      <option value="rail">Electrified Rail Freight</option>
                      <option value="electric_van">Electric Commercial Van</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-industrial-400 mb-1">Avg Distance (km)</label>
                    <input
                      type="number"
                      value={t.distance_km}
                      onChange={(ev) => {
                        const updated = [...transportInputs];
                        updated[idx].distance_km = parseFloat(ev.target.value) || 0;
                        setTransportInputs(updated);
                      }}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-industrial-400 mb-1">Payload (Tonnes)</label>
                    <input
                      type="number"
                      value={t.weight_tonnes}
                      onChange={(ev) => {
                        const updated = [...transportInputs];
                        updated[idx].weight_tonnes = parseFloat(ev.target.value) || 0;
                        setTransportInputs(updated);
                      }}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="w-full">
                      <label className="block text-[11px] text-industrial-400 mb-1">Trips / Month</label>
                      <input
                        type="number"
                        min={1}
                        value={t.frequency_per_month}
                        onChange={(ev) => {
                          const updated = [...transportInputs];
                          updated[idx].frequency_per_month = parseInt(ev.target.value) || 1;
                          setTransportInputs(updated);
                        }}
                        className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    {transportInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTransportRow(idx)}
                        className="p-1.5 text-industrial-500 hover:text-carbon-critical"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Production */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-industrial-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Factory className="w-4 h-4 text-carbon-lime" /> Step 5: Production Output & Context
              </h3>
              <p className="text-xs text-industrial-400">
                Calibrates Carbon Intensity (kg CO₂e per production unit).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-industrial-300 mb-1">Assessment Name</label>
                <input
                  type="text"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-industrial-300 mb-1">Monthly Production Volume</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={monthlyProduction}
                    onChange={(e) => setMonthlyProduction(parseFloat(e.target.value) || 1)}
                    className="w-2/3 bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    value={productionUnit}
                    onChange={(e) => setProductionUnit(e.target.value)}
                    placeholder="tonnes fabric"
                    className="w-1/3 bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Trigger Analysis */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-industrial-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-carbon-green" /> Step 6: Review & AI Diagnostic Trigger
              </h3>
              <p className="text-xs text-industrial-400">
                Review entered operational data before running deterministic calculation & ML hotspot detection.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-industrial-950/60 rounded-xl border border-industrial-800">
                <span className="text-industrial-400 block text-[11px]">Energy Streams</span>
                <span className="text-white font-bold font-mono text-sm">{energyInputs.length} sources</span>
              </div>
              <div className="p-3 bg-industrial-950/60 rounded-xl border border-industrial-800">
                <span className="text-industrial-400 block text-[11px]">Materials Feedstock</span>
                <span className="text-white font-bold font-mono text-sm">{materialInputs.length} items</span>
              </div>
              <div className="p-3 bg-industrial-950/60 rounded-xl border border-industrial-800">
                <span className="text-industrial-400 block text-[11px]">Waste Streams</span>
                <span className="text-white font-bold font-mono text-sm">{wasteInputs.length} channels</span>
              </div>
              <div className="p-3 bg-industrial-950/60 rounded-xl border border-industrial-800">
                <span className="text-industrial-400 block text-[11px]">Freight Operations</span>
                <span className="text-white font-bold font-mono text-sm">{transportInputs.length} routes</span>
              </div>
            </div>

            {analyzing ? (
              <div className="p-8 rounded-xl bg-industrial-950/90 border border-carbon-green/40 shadow-glow-green text-center space-y-4">
                <div className="w-12 h-12 border-3 border-carbon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h4 className="text-base font-bold text-white font-mono">Running AI Carbon Analysis</h4>
                <div className="max-w-md mx-auto space-y-2 text-left text-xs text-industrial-300 font-mono">
                  <div className={`flex items-center gap-2 ${analysisStep >= 0 ? "text-carbon-green" : "text-industrial-600"}`}>
                    <span>{analysisStep >= 0 ? "✓" : "○"}</span> Processing energy combustion & electricity grid factors
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStep >= 1 ? "text-carbon-green" : "text-industrial-600"}`}>
                    <span>{analysisStep >= 1 ? "✓" : "○"}</span> Computing Scope 3 raw material embodied carbon
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStep >= 2 ? "text-carbon-green" : "text-industrial-600"}`}>
                    <span>{analysisStep >= 2 ? "✓" : "○"}</span> Mapping waste diversion and fugitive methane leaks
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStep >= 3 ? "text-carbon-green" : "text-industrial-600"}`}>
                    <span>{analysisStep >= 3 ? "✓" : "○"}</span> Executing Isolation Forest emission hotspot detection
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStep >= 4 ? "text-carbon-green" : "text-industrial-600"}`}>
                    <span>{analysisStep >= 4 ? "✓" : "○"}</span> Matching circular alternative knowledge base
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStep >= 5 ? "text-carbon-green" : "text-industrial-600"}`}>
                    <span>{analysisStep >= 5 ? "✓" : "○"}</span> Calculating CAPEX, annual savings, and payback periods
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRunAnalysis}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-carbon-emerald via-carbon-green to-carbon-lime text-industrial-950 font-extrabold text-sm hover:opacity-95 transition-all shadow-glow-green flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Run AI Carbon Analysis</span>
              </button>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        {!analyzing && (
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-industrial-800">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 rounded-xl bg-industrial-800 hover:bg-industrial-700 text-xs font-semibold text-industrial-200 flex items-center space-x-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 6 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-5 py-2 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold flex items-center space-x-1.5 transition-all shadow-glow-green"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bill & Invoice OCR Modal */}
      <BillOcrModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onApplyInputs={handleApplyOcrInputs}
      />
    </div>
  );
};
