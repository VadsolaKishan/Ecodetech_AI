import React, { useState, useEffect } from "react";
import { Building, Save, CheckCircle2, MapPin, Users, Clock, Flame, Boxes, Trash2 } from "lucide-react";
import { industryApi } from "../services/api";
import { Industry } from "../types";

const defaultProfile: Partial<Industry> = {
  company_name: "",
  industry_type: "Manufacturing",
  factory_location: "",
  production_type: "Batch Processing",
  monthly_production: 100,
  production_unit: "tonnes",
  number_of_employees: 50,
  operating_hours_per_day: 16,
  main_energy_sources: "Grid electricity, Coal, Diesel",
  main_raw_materials: "Virgin raw materials",
  main_waste_types: "Process scrap, packaging waste",
};

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Partial<Industry>>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await industryApi.getProfile(true);
        if (data && typeof data === "object") {
          setProfile((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Error loading industry profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await industryApi.updateProfile(profile);
      if (updated) {
        setProfile((prev) => ({ ...prev, ...updated }));
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to save profile. Please ensure all required fields are filled.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-carbon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-industrial-400">Loading industrial profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 space-y-6 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div className="pb-4 border-b border-industrial-800">
        <div className="flex items-center space-x-2 text-xs font-mono text-carbon-green mb-1">
          <Building className="w-4 h-4" />
          <span>Industrial Baseline Profile</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Factory & Enterprise Metadata</h1>
        <p className="text-xs text-industrial-400 mt-1">
          Operational specifications used to benchmark carbon intensity and tailor circular interventions.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-carbon-green/20 border border-carbon-green text-carbon-green rounded-xl text-xs flex items-center space-x-2 shadow-glow-green animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Industrial profile successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 p-6 rounded-2xl bg-industrial-900/90 border border-industrial-800 shadow-card-dark">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1">Company / Facility Name</label>
            <input
              type="text"
              required
              value={profile.company_name || ""}
              onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1">Industry Sector</label>
            <select
              value={profile.industry_type || "Manufacturing"}
              onChange={(e) => setProfile({ ...profile, industry_type: e.target.value })}
              className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="Manufacturing">General Manufacturing</option>
              <option value="Textile">Textile & Synthetic Fabrics</option>
              <option value="Food Processing">Food & Beverage Processing</option>
              <option value="Packaging">Polymer & Paper Packaging</option>
              <option value="Cement">Cement & Building Materials</option>
              <option value="Chemical">Specialty Chemicals</option>
              <option value="Metal">Steel & Metal Fabrication</option>
              <option value="Automotive">Automotive Ancillaries</option>
              <option value="Other">Other Custom Industry</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1">Factory Location / Hub</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-industrial-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={profile.factory_location || ""}
                onChange={(e) => setProfile({ ...profile, factory_location: e.target.value })}
                placeholder="e.g. Pandesara GIDC, Surat, Gujarat"
                className="w-full bg-industrial-950 border border-industrial-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1">Production Process Type</label>
            <input
              type="text"
              value={profile.production_type || ""}
              onChange={(e) => setProfile({ ...profile, production_type: e.target.value })}
              placeholder="e.g. Synthetic yarn weaving & thermal sizing"
              className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-industrial-800">
          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1">Monthly Production</label>
            <input
              type="number"
              value={profile.monthly_production || 0}
              onChange={(e) => setProfile({ ...profile, monthly_production: parseFloat(e.target.value) || 0 })}
              className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1">Production Unit</label>
            <input
              type="text"
              value={profile.production_unit || "tonnes"}
              onChange={(e) => setProfile({ ...profile, production_unit: e.target.value })}
              className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1">Plant Workforce</label>
            <div className="relative">
              <Users className="w-4 h-4 text-industrial-500 absolute left-3 top-2.5" />
              <input
                type="number"
                value={profile.number_of_employees || 50}
                onChange={(e) => setProfile({ ...profile, number_of_employees: parseInt(e.target.value) || 0 })}
                className="w-full bg-industrial-950 border border-industrial-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-industrial-800">
          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-carbon-amber" /> Main Energy Sources
            </label>
            <input
              type="text"
              value={profile.main_energy_sources || ""}
              onChange={(e) => setProfile({ ...profile, main_energy_sources: e.target.value })}
              className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1 flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-carbon-cyber" /> Main Raw Materials
            </label>
            <input
              type="text"
              value={profile.main_raw_materials || ""}
              onChange={(e) => setProfile({ ...profile, main_raw_materials: e.target.value })}
              className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5 text-carbon-critical" /> Main Waste Streams
            </label>
            <input
              type="text"
              value={profile.main_waste_types || ""}
              onChange={(e) => setProfile({ ...profile, main_waste_types: e.target.value })}
              className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-industrial-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold flex items-center space-x-2 transition-all shadow-glow-green"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Industrial Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
