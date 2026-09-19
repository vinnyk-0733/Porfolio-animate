"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import {
  Award,
  Medal,
  ShieldCheck,
  FileBadge,
  CheckCircle,
  Sparkles,
  BarChart,
  Cpu,
  Activity,
  Database,
  BrainCircuit,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Sliders,
} from "lucide-react";
import Link from "next/link";
import { defaultCertifications, CertificationItem } from "@/lib/default-data";
import { useAdmin } from "@/context/admin-context";
import { Button } from "@/components/ui/button";

const MorphingCardStack = dynamic(
  () => import("@/components/ui/morphing-card-stack").then((mod) => mod.MorphingCardStack),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    ),
  }
);

const certIconMap: Record<string, React.ReactNode> = {
  Activity: <Activity className="h-6 w-6 text-cyan-400" />,
  Database: <Database className="h-6 w-6 text-indigo-400" />,
  FileBadge: <FileBadge className="h-6 w-6 text-blue-500" />,
  Award: <Award className="h-6 w-6 text-red-500" />,
  BrainCircuit: <BrainCircuit className="h-6 w-6 text-pink-500" />,
  CheckCircle: <CheckCircle className="h-6 w-6 text-sky-400" />,
  ShieldCheck: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
  BarChart: <BarChart className="h-6 w-6 text-emerald-400" />,
  Sparkles: <Sparkles className="h-6 w-6 text-purple-400" />,
  Cpu: <Cpu className="h-6 w-6 text-red-400" />,
  Medal: <Medal className="h-6 w-6 text-amber-400" />,
};

function mapCertifications(items: CertificationItem[]) {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    icon: certIconMap[item.iconName] || <Award className="h-6 w-6 text-yellow-400" />,
    color: item.color || "rgba(255, 255, 255, 0.05)",
    link: item.link,
  }));
}

export default function CertificationsPage() {
  const { isAdmin, confirmDelete, editFetch } = useAdmin();
  const [certItems, setCertItems] = useState<CertificationItem[]>(defaultCertifications);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [iconName, setIconName] = useState("Award");
  const [color, setColor] = useState("rgba(16, 185, 129, 0.05)");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/certifications", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CertificationItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCertItems(data);
        }
      })
      .catch((err) => console.warn("Could not fetch certifications from MongoDB, using fallback", err));
  }, []);

  const saveCertsToDb = async (updated: CertificationItem[]) => {
    setIsSaving(true);
    try {
      const res = await editFetch("/api/certifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setCertItems(updated);
      } else {
        alert("Failed to save certifications to database.");
      }
    } catch (err) {
      alert("Error saving certifications to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAdd = () => {
    setTitle("");
    setDescription("");
    setLink("https://");
    setIconName("Award");
    setColor("rgba(56, 189, 248, 0.05)");
    setAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    const newCert: CertificationItem = {
      id: `cert-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      iconName,
      color,
      order: certItems.length + 1,
    };

    const updated = [newCert, ...certItems];
    await saveCertsToDb(updated);
    setAddModalOpen(false);
  };

  const handleDelete = (item: CertificationItem) => {
    confirmDelete({
      title: "Delete Certification?",
      message: "Are you sure you want to delete this certificate? This will be permanently removed from your portfolio and database.",
      itemName: item.title,
      confirmText: "Accept",
      cancelText: "Cancel",
      onAccept: async () => {
        const updated = certItems.filter((c) => c.id !== item.id);
        await saveCertsToDb(updated);
      },
    });
  };

  return (
    <main className="relative min-h-screen bg-black overflow-y-auto flex flex-col items-center justify-start sm:justify-center p-4 sm:p-8 md:p-16 pt-16 pb-36 sm:pb-28 selection:bg-white/20">

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center h-full pointer-events-auto">
        <div className="w-full flex justify-between items-center mb-8 sm:mb-12">
          <Link
            href="/"
            className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-2 text-xs sm:text-sm backdrop-blur-md bg-white/5 hover:bg-white/10 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 shadow-xl"
          >
            <ArrowLeft size={16} /> Back to Hub
          </Link>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs gap-1.5 shadow-xl backdrop-blur-md px-3.5 py-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Certificate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setManageModalOpen(true)}
                className="rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs gap-1.5 px-3.5 py-1.5"
              >
                <Sliders className="w-3.5 h-3.5" /> Manage ({certItems.length})
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-neutral-500 tracking-tight drop-shadow-sm mb-3 sm:mb-6">
            Certifications
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-xs sm:text-base md:text-lg leading-relaxed font-light px-2">
            A comprehensive record of standard professional validations, showcasing recognized expertise across cloud infrastructure, machine learning, and orchestration ecosystems.
          </p>
        </div>

        <div className="w-full flex-grow flex flex-col items-center justify-center min-h-[460px]">
          <MorphingCardStack cards={mapCertifications(certItems)} defaultLayout="stack" />
        </div>
      </div>

      {/* Add Certificate Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-neutral-950/95 p-6 text-white shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Add New Certification</h3>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Certification Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AWS Certified Machine Learning Specialty"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of skills, techniques and domain expertise validated..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Credential URL</label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Icon Badge</label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Award">Award</option>
                    <option value="Medal">Medal</option>
                    <option value="FileBadge">File Badge</option>
                    <option value="CheckCircle">Check Circle</option>
                    <option value="ShieldCheck">Shield Check</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="BrainCircuit">Brain Circuit</option>
                    <option value="Cpu">CPU</option>
                    <option value="Database">Database</option>
                    <option value="Activity">Activity</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddModalOpen(false)}
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
                  <Check className="w-3.5 h-3.5" /> Save to Database
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Certifications Modal */}
      {manageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-neutral-950/95 p-6 text-white shadow-2xl backdrop-blur-xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setManageModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Manage Certifications ({certItems.length})</h3>
            </div>

            <div className="space-y-3">
              {certItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl border border-white/10 bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5">{item.description}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-400/80 hover:text-emerald-300 underline truncate block mt-1"
                      >
                        {item.link}
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg shrink-0"
                    title="Delete Certificate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-5 border-t border-white/10 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManageModalOpen(false)}
                className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
