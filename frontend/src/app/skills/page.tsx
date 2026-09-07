"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import type { BarMarker } from "@/components/ui/cobe-globe-bars"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, Globe, Sliders } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { defaultSkills, SkillsData, SkillMarker, SkillCategory } from "@/lib/default-data"
import { useAdmin } from "@/context/admin-context"

const GlobeBars = dynamic(
  () => import("@/components/ui/cobe-globe-bars").then((mod) => mod.GlobeBars),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    ),
  }
);

const REGION_PRESETS = [
  { name: "San Francisco, USA", location: [37.77, -122.41] },
  { name: "New York, USA", location: [40.71, -74.01] },
  { name: "London, UK", location: [51.51, -0.13] },
  { name: "Berlin, Germany", location: [52.52, 13.4] },
  { name: "Helsinki, Finland", location: [60.16, 24.93] },
  { name: "Tokyo, Japan", location: [35.68, 139.65] },
  { name: "Bengaluru, India", location: [12.97, 77.59] },
  { name: "Singapore", location: [1.35, 103.82] },
  { name: "Sydney, Australia", location: [-33.86, 151.2] },
  { name: "Sao Paulo, Brazil", location: [-23.55, -46.63] },
  { name: "Cape Town, South Africa", location: [-33.92, 18.42] },
];

export default function SkillsPage() {
  const { isAdmin, confirmDelete } = useAdmin();
  const [skillsData, setSkillsData] = useState<SkillsData>(defaultSkills);

  // Modals state
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  // Add skill form state
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState(80);
  const [selectedPreset, setSelectedPreset] = useState(0);

  // Editing categories
  const [editCategories, setEditCategories] = useState<SkillCategory[]>(defaultSkills.categories);
  const [editHeading, setEditHeading] = useState(defaultSkills.heading);
  const [editSubheading, setEditSubheading] = useState(defaultSkills.subheading);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/skills", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SkillsData) => {
        if (data && Array.isArray(data.markers) && data.markers.length > 0) {
          setSkillsData(data);
          setEditCategories(data.categories || defaultSkills.categories);
          setEditHeading(data.heading || defaultSkills.heading);
          setEditSubheading(data.subheading || defaultSkills.subheading);
        }
      })
      .catch((err) => console.warn("Could not fetch skills from MongoDB, using fallback", err));
  }, []);

  const saveSkillsToDb = async (updated: SkillsData) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        setSkillsData(updated);
      } else {
        alert("Failed to save skills to database.");
      }
    } catch (err) {
      alert("Error saving skills to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      alert("Please provide a skill name.");
      return;
    }

    const loc = REGION_PRESETS[selectedPreset]?.location || [37.77, -122.41];
    const newMarker: SkillMarker = {
      id: `skl-${Date.now()}`,
      label: newLabel.trim().toUpperCase(),
      value: Number(newValue),
      location: [loc[0], loc[1]],
    };

    const updated: SkillsData = {
      ...skillsData,
      markers: [...skillsData.markers, newMarker],
    };

    await saveSkillsToDb(updated);
    setNewLabel("");
    setNewValue(80);
    setAddSkillOpen(false);
  };

  const handleDeleteMarker = (marker: SkillMarker) => {
    confirmDelete({
      title: "Delete Skill Marker?",
      message: "Are you sure you want to remove this skill marker from the 3D Earth globe? This will immediately update your database.",
      itemName: `${marker.label} (${marker.value}%)`,
      confirmText: "Accept",
      cancelText: "Cancel",
      onAccept: async () => {
        const updatedMarkers = skillsData.markers.filter((m) => m.id !== marker.id);
        const updated: SkillsData = {
          ...skillsData,
          markers: updatedMarkers,
        };
        await saveSkillsToDb(updated);
      },
    });
  };

  const handleDeleteCategory = (index: number, catTitle: string) => {
    confirmDelete({
      title: "Delete Skill Category?",
      message: "Are you sure you want to remove this skill category card? Remember to click 'Save Changes to Database' to persist.",
      itemName: catTitle,
      confirmText: "Accept",
      cancelText: "Cancel",
      onAccept: () => {
        const updated = editCategories.filter((_, idx) => idx !== index);
        setEditCategories(updated);
      },
    });
  };

  const handleUpdateMarkerValue = async (markerId: string, value: number) => {
    const updatedMarkers = skillsData.markers.map((m) =>
      m.id === markerId ? { ...m, value } : m
    );
    const updated: SkillsData = {
      ...skillsData,
      markers: updatedMarkers,
    };
    setSkillsData(updated);
  };

  const handleSaveManageModal = async () => {
    const updated: SkillsData = {
      ...skillsData,
      heading: editHeading,
      subheading: editSubheading,
      categories: editCategories,
    };
    await saveSkillsToDb(updated);
    setManageModalOpen(false);
  };

  return (
    <main className="relative min-h-screen bg-black overflow-hidden flex flex-col md:flex-row items-center justify-center p-6 sm:p-12 md:p-24 selection:bg-white/20">

      {/* Top Left Navigation Header */}
      <div className="absolute top-8 left-8 z-20 pointer-events-auto flex items-center gap-3">
        <Link
          href="/#resume"
          className="text-white/50 hover:text-white transition-colors inline-flex items-center gap-2 text-sm backdrop-blur-md bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-xl"
        >
          <ArrowLeft size={16} /> Back to Hub
        </Link>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setAddSkillOpen(true)}
              className="rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs gap-1.5 shadow-xl backdrop-blur-md px-3.5 py-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Globe Skill
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditHeading(skillsData.heading);
                setEditSubheading(skillsData.subheading);
                setEditCategories([...skillsData.categories]);
                setManageModalOpen(true);
              }}
              className="rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs gap-1.5 px-3.5 py-1.5"
            >
              <Sliders className="w-3.5 h-3.5" /> Manage All Skills
            </Button>
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24 h-full pointer-events-auto mt-20 md:mt-0">

        {/* Left Column Text Content */}
        <div className="flex flex-col justify-center max-w-xl shrink-0 w-full md:w-1/2 space-y-6">
          <Badge className="w-fit bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">
            {skillsData.badge || "TECH STACK"}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-4">
            My <span className="text-emerald-400">Skills</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl leading-relaxed">
            {skillsData.subheading}
          </p>

          <div className="pt-6 grid grid-cols-2 gap-4">
            {skillsData.categories.map((cat, idx) => (
              <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg relative group">
                <h3 className="text-white font-bold mb-1">{cat.title}</h3>
                <p className="text-sm text-neutral-400">{cat.skills}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: 3D Interactive Cobe Globe */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          <GlobeBars
            key={skillsData.markers.length}
            markers={skillsData.markers as BarMarker[]}
            className="w-full max-w-xl aspect-square drop-shadow-[0_0_50px_rgba(52,211,152,0.2)]"
          />
        </div>

      </div>

      {/* Modal 1: Add Skill to 3D Globe */}
      {addSkillOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md pointer-events-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-neutral-950/95 p-6 text-white shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setAddSkillOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Add Skill to 3D Earth Globe</h3>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Skill Name / Label</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. PYTORCH, DOCKER, KUBERNETES"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Proficiency Level ({newValue}%)
                </label>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Globe Location / Region Anchor
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  {REGION_PRESETS.map((p, idx) => (
                    <option key={idx} value={idx}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddSkillOpen(false)}
                  className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Add to Globe & DB
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Manage All Skills & Globe Markers */}
      {manageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md pointer-events-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-neutral-950/95 p-6 text-white shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setManageModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Manage Globe Skills & Categories</h3>
            </div>

            <div className="space-y-6">
              {/* Globe Markers List */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-2">
                  3D Globe Bar Markers ({skillsData.markers.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {skillsData.markers.map((marker) => (
                    <div
                      key={marker.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-white/10 bg-white/5"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-white">{marker.label}</span>
                        <span className="text-xs text-white/40 ml-2">({marker.value}%)</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={20}
                          max={100}
                          value={marker.value}
                          onChange={(e) => handleUpdateMarkerValue(marker.id, Number(e.target.value))}
                          className="w-24 accent-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteMarker(marker)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          title="Delete Marker"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories Edit */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-2">
                  Skill Category Cards
                </h4>
                <div className="space-y-3">
                  {editCategories.map((cat, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2 relative group">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={cat.title}
                          onChange={(e) => {
                            const updated = [...editCategories];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setEditCategories(updated);
                          }}
                          className="flex-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(idx, cat.title)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg shrink-0"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={cat.skills}
                        onChange={(e) => {
                          const updated = [...editCategories];
                          updated[idx] = { ...updated[idx], skills: e.target.value };
                          setEditCategories(updated);
                        }}
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-neutral-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 border-t border-white/10 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManageModalOpen(false)}
                className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveManageModal}
                disabled={isSaving}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes to Database
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
