import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
  Flame,
  Boxes,
  Loader2,
  ScanLine,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard
} from "lucide-react";
import { assessmentApi } from "../services/api";

export interface SuggestedItem {
  target_step: string;
  source_type?: string;
  material_name?: string;
  material_type?: string;
  waste_type?: string;
  quantity: number;
  unit: string;
  renewable_percentage?: number;
  virgin_percentage?: number;
  recycled_percentage?: number;
  supplier_distance_km?: number;
  notes?: string;
}

export interface OcrResultData {
  document_type: string;
  vendor_or_utility?: string;
  consumer_or_invoice_no?: string;
  billing_period?: string;
  total_amount_inr?: number;
  confidence_score: number;
  extracted_metrics: Record<string, any>;
  suggested_inputs: SuggestedItem[];
  summary: string;
  engine_used?: string;
  is_sample_demo?: boolean;
}

interface BillOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyInputs: (items: SuggestedItem[], summaryMsg: string) => void;
}

export const BillOcrModal: React.FC<BillOcrModalProps> = ({
  isOpen,
  onClose,
  onApplyInputs,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "samples">("samples");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanningPhase, setScanningPhase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResultData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      setOcrResult(null);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setError(null);
      setOcrResult(null);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const runOcrScanningSequence = async (scanAction: () => Promise<OcrResultData>) => {
    setLoading(true);
    setError(null);
    setOcrResult(null);

    const phases = [
      "Uploading document buffer...",
      "Analyzing document structure with Gemini 3.6 Flash...",
      "Extracting utility tariff, kWh & fuel units...",
      "Validating GHG Protocol Scope 1/2/3 factors..."
    ];

    let phaseIndex = 0;
    setScanningPhase(phases[0]);
    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setScanningPhase(phases[phaseIndex]);
    }, 700);

    try {
      const data = await scanAction();
      setOcrResult(data);
    } catch (err: any) {
      console.error("OCR scan error", err);
      setError(err.response?.data?.detail || "Failed to parse document. Please check the file or try a sample preset.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleScanUploadedFile = () => {
    if (!selectedFile) return;
    runOcrScanningSequence(() => assessmentApi.scanBill(selectedFile));
  };

  const handleLoadSample = (sampleType: string) => {
    runOcrScanningSequence(() => assessmentApi.scanSampleBill(sampleType));
  };

  const handleApply = () => {
    if (!ocrResult || !ocrResult.suggested_inputs) return;
    onApplyInputs(ocrResult.suggested_inputs, ocrResult.summary);
    onClose();
  };

  const resetModal = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setOcrResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-industrial-900 border border-carbon-green/30 rounded-2xl shadow-2xl shadow-carbon-green/10 text-white overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-industrial-800 bg-industrial-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-carbon-green/15 border border-carbon-green/40 flex items-center justify-center text-carbon-green shadow-glow-green">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Snap & Ingest — AI Bill & Invoice OCR</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-carbon-green/20 text-carbon-green border border-carbon-green/30">
                  Gemini 3.6 Flash Vision
                </span>
              </div>
              <p className="text-xs text-industrial-400">
                Upload electricity bills or fuel receipts to auto-populate Scope 1 & 2 inputs in 3 seconds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-industrial-400 hover:text-white hover:bg-industrial-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Tabs */}
          <div className="flex rounded-xl bg-industrial-950 p-1 border border-industrial-800">
            <button
              onClick={() => { setActiveTab("samples"); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                activeTab === "samples"
                  ? "bg-carbon-green text-industrial-950 shadow-md font-bold"
                  : "text-industrial-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Demo Sample Bills (Instant)
            </button>
            <button
              onClick={() => { setActiveTab("upload"); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                activeTab === "upload"
                  ? "bg-carbon-green text-industrial-950 shadow-md font-bold"
                  : "text-industrial-400 hover:text-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload File (Image / PDF)
            </button>
          </div>

          {/* SAMPLES TAB */}
          {activeTab === "samples" && !ocrResult && !loading && (
            <div className="space-y-3">
              <div className="text-xs text-industrial-400 mb-1">
                Choose a pre-formatted industrial utility bill or supply voucher to test live extraction:
              </div>

              {/* Sample 1: Torrent Power Electricity */}
              <div
                onClick={() => handleLoadSample("electricity_torrent")}
                className="group p-4 rounded-xl bg-industrial-950/70 border border-industrial-800 hover:border-carbon-green/60 hover:bg-industrial-800/50 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-carbon-amber/15 border border-carbon-amber/30 flex items-center justify-center text-carbon-amber mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-carbon-green transition">
                        Torrent Power Ltd. (High Tension HT-1)
                      </span>
                      <span className="px-1.5 py-0.2 text-[10px] rounded bg-carbon-amber/20 text-carbon-amber border border-carbon-amber/30">
                        Scope 2 Electricity
                      </span>
                    </div>
                    <p className="text-xs text-industrial-400 mt-0.5">
                      Billed Units: <strong className="text-industrial-200">142,500 kWh</strong> • Demand: <strong className="text-industrial-200">380 kVA</strong> • Tariff: ₹11,84,500
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-carbon-green/20 text-carbon-green group-hover:bg-carbon-green group-hover:text-industrial-950 transition flex items-center gap-1">
                  Extract <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Sample 2: Indian Oil Boiler Diesel */}
              <div
                onClick={() => handleLoadSample("fuel_diesel_iocl")}
                className="group p-4 rounded-xl bg-industrial-950/70 border border-industrial-800 hover:border-carbon-green/60 hover:bg-industrial-800/50 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mt-0.5">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-carbon-green transition">
                        Indian Oil Corp. Bulk Diesel Delivery Challan
                      </span>
                      <span className="px-1.5 py-0.2 text-[10px] rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        Scope 1 Thermal Fuel
                      </span>
                    </div>
                    <p className="text-xs text-industrial-400 mt-0.5">
                      Fuel: <strong className="text-industrial-200">HSD Diesel (4,500 Litres)</strong> • Boiler Feed • Amount: ₹4,18,500
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-carbon-green/20 text-carbon-green group-hover:bg-carbon-green group-hover:text-industrial-950 transition flex items-center gap-1">
                  Extract <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Sample 3: Raw Cotton Invoice */}
              <div
                onClick={() => handleLoadSample("material_cotton")}
                className="group p-4 rounded-xl bg-industrial-950/70 border border-industrial-800 hover:border-carbon-green/60 hover:bg-industrial-800/50 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mt-0.5">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-carbon-green transition">
                        Raw Shankar-6 Cotton Inbound Tax Invoice
                      </span>
                      <span className="px-1.5 py-0.2 text-[10px] rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Scope 3 Material
                      </span>
                    </div>
                    <p className="text-xs text-industrial-400 mt-0.5">
                      Quantity: <strong className="text-industrial-200">25 Tonnes</strong> • 20% Recycled Blend • Inbound Distance: 120 km
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-carbon-green/20 text-carbon-green group-hover:bg-carbon-green group-hover:text-industrial-950 transition flex items-center gap-1">
                  Extract <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === "upload" && !ocrResult && !loading && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-industrial-700 hover:border-carbon-green/60 rounded-2xl bg-industrial-950/60 hover:bg-industrial-950/90 cursor-pointer transition flex flex-col items-center justify-center text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-carbon-green/10 border border-carbon-green/30 flex items-center justify-center text-carbon-green mb-3 group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  Click to browse or drag & drop industrial bill
                </p>
                <p className="text-xs text-industrial-400">
                  Supports PNG, JPG, WEBP, and PDF documents (up to 10 MB)
                </p>
              </div>

              {selectedFile && (
                <div className="p-4 rounded-xl bg-industrial-950 border border-industrial-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-industrial-800 flex items-center justify-center text-carbon-green">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{selectedFile.name}</div>
                      <div className="text-[11px] text-industrial-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Document"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleScanUploadedFile}
                    className="px-4 py-2 rounded-xl bg-carbon-green text-industrial-950 font-bold text-xs hover:bg-carbon-green-hover shadow-glow-green transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Scan with Gemini AI
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SCANNING RADAR ANIMATION */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-carbon-green/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-carbon-green/40 animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-carbon-green/20 border border-carbon-green flex items-center justify-center text-carbon-green shadow-glow-green">
                  <ScanLine className="w-6 h-6 animate-bounce" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-carbon-green" /> Gemini Multimodal OCR Active
                </h4>
                <p className="text-xs text-carbon-green font-mono mt-1 animate-pulse">
                  {scanningPhase}
                </p>
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* OCR RESULTS DASHBOARD */}
          {ocrResult && !loading && (
            <div className="space-y-4 animate-fade-in">
              {/* Top Banner Status */}
              <div className="p-4 rounded-xl bg-carbon-green/10 border border-carbon-green/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-carbon-green/20 flex items-center justify-center text-carbon-green">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{ocrResult.vendor_or_utility || "Industrial Utility Document"}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-carbon-green/20 text-carbon-green border border-carbon-green/30">
                        {Math.round(ocrResult.confidence_score * 100)}% Confidence
                      </span>
                    </div>
                    <div className="text-[11px] text-industrial-300 mt-0.5">
                      {ocrResult.summary}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Details Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-industrial-950 border border-industrial-800">
                  <div className="text-[10px] text-industrial-400 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-carbon-green" /> Account / Invoice
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {ocrResult.consumer_or_invoice_no || "N/A"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-industrial-950 border border-industrial-800">
                  <div className="text-[10px] text-industrial-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-carbon-green" /> Billing Cycle
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    {ocrResult.billing_period || "Current Month"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-industrial-950 border border-industrial-800">
                  <div className="text-[10px] text-industrial-400 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-carbon-green" /> Billed Amount
                  </div>
                  <div className="text-xs font-bold text-carbon-green mt-1">
                    {ocrResult.total_amount_inr ? `₹${ocrResult.total_amount_inr.toLocaleString("en-IN")}` : "Verified"}
                  </div>
                </div>
              </div>

              {/* Suggested Inputs Preview */}
              <div className="p-4 rounded-xl bg-industrial-950 border border-industrial-800 space-y-2">
                <div className="text-xs font-bold text-industrial-300 flex items-center justify-between">
                  <span>Target Carbon Accounting Inputs to Apply:</span>
                  <span className="text-[11px] text-carbon-green font-mono">
                    {ocrResult.engine_used || "Gemini 3.6 Flash"}
                  </span>
                </div>

                <div className="space-y-2">
                  {ocrResult.suggested_inputs.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-industrial-900 border border-industrial-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {item.target_step === "energy" ? (
                          <Zap className="w-4 h-4 text-carbon-amber" />
                        ) : (
                          <Boxes className="w-4 h-4 text-blue-400" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-white capitalize">
                            {(item.source_type || item.material_name || "Resource").replace("_", " ")}
                          </div>
                          <div className="text-[11px] text-industrial-400">
                            Quantity: <strong className="text-industrial-200">{item.quantity.toLocaleString()} {item.unit}</strong>
                            {item.recycled_percentage ? ` • ${item.recycled_percentage}% Recycled Content` : ""}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-industrial-800 text-carbon-green border border-industrial-700">
                        Step: {item.target_step.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="px-4 py-2 rounded-xl text-xs text-industrial-400 hover:text-white hover:bg-industrial-800 transition"
                >
                  Scan Another Bill
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-5 py-2.5 rounded-xl bg-carbon-green text-industrial-950 font-bold text-xs hover:bg-carbon-green-hover shadow-glow-green transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Apply to Assessment Wizard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
