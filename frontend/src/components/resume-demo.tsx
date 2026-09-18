"use client";

import React, { useState, useEffect } from "react";
import { UserRound, Wrench, Briefcase, FolderGit2, GraduationCap, Award, Pencil, Check, X, Sliders } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { defaultTimeline, TimelineSectionItem } from "@/lib/default-data";
import { useAdmin } from "@/context/admin-context";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ElementType> = {
  UserRound,
  Wrench,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
};

function renderTimelineContent(item: TimelineSectionItem): React.ReactNode {
  if (item.details?.paragraphs && item.details.paragraphs.length > 0) {
    return (
      <div className="space-y-2">
        {item.details.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    );
  }

  if (item.details?.sections && item.details.sections.length > 0) {
    return (
      <div className="space-y-4">
        {item.details.sections.map((sec, idx) => (
          <div key={idx}>
            <strong className="text-white block mb-1">{sec.title}</strong>
            {sec.subtitle && (
              <span className="text-[10px] text-white/50 block mb-1">{sec.subtitle}</span>
            )}
            {sec.text && (
              <p className="text-white/60 leading-tight">{sec.text}</p>
            )}
            {sec.items && sec.items.length > 0 && (
              <ul className="list-disc list-inside text-white/60 space-y-1">
                {sec.items.map((li, i) => (
                  <li key={i}>{li}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <div>{item.title}</div>;
}

function mapToTimelineItems(rawItems: TimelineSectionItem[]) {
  return rawItems.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    category: item.category,
    icon: iconMap[item.iconName] || UserRound,
    relatedIds: item.relatedIds || [],
    status: (item.status || "completed") as "completed" | "in-progress" | "pending",
    energy: item.energy ?? 90,
    actionUrl: item.actionUrl,
    content: renderTimelineContent(item),
  }));
}

export function ResumeDemo() {
  const { isAdmin } = useAdmin();
  const [rawTimeline, setRawTimeline] = useState<TimelineSectionItem[]>(defaultTimeline);
  const [timelineItems, setTimelineItems] = useState(() => mapToTimelineItems(defaultTimeline));

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [editingItems, setEditingItems] = useState<TimelineSectionItem[]>(defaultTimeline);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/timeline", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: TimelineSectionItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setRawTimeline(data);
          setEditingItems(data);
          setTimelineItems(mapToTimelineItems(data));
        }
      })
      .catch((err) => console.warn("Could not fetch timeline from MongoDB, using fallback", err));
  }, []);

  const handleOpenEdit = () => {
    setEditingItems(JSON.parse(JSON.stringify(rawTimeline)));
    setEditModalOpen(true);
  };

  const handleSaveToDb = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/timeline", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItems),
      });

      if (res.ok) {
        setRawTimeline(editingItems);
        setTimelineItems(mapToTimelineItems(editingItems));
        setEditModalOpen(false);
      } else {
        alert("Failed to save timeline to database.");
      }
    } catch (err) {
      alert("Error saving timeline to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const activeItem = editingItems.find((i) => i.id === activeTab) || editingItems[0];

  return (
    <>
      {/* Admin Edit Trigger */}
      {isAdmin && (
        <div className="absolute top-8 right-8 z-30 pointer-events-auto">
          <Button
            size="sm"
            onClick={handleOpenEdit}
            className="rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs gap-1.5 shadow-2xl backdrop-blur-md px-4 py-2"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Resume Sections
          </Button>
        </div>
      )}

      <RadialOrbitalTimeline timelineData={timelineItems} />

      {/* Edit Resume Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-white/15 bg-neutral-950 p-4 sm:p-6 text-white shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Edit Resume Orbit Sections</h3>
            </div>

            {/* Orbit Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-3 mb-4">
              {editingItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === item.id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Active Item Form */}
            {activeItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Section Title</label>
                    <input
                      type="text"
                      value={activeItem.title}
                      onChange={(e) => {
                        const updated = editingItems.map((i) =>
                          i.id === activeItem.id ? { ...i, title: e.target.value } : i
                        );
                        setEditingItems(updated);
                      }}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Subtitle / Badge</label>
                    <input
                      type="text"
                      value={activeItem.date}
                      onChange={(e) => {
                        const updated = editingItems.map((i) =>
                          i.id === activeItem.id ? { ...i, date: e.target.value } : i
                        );
                        setEditingItems(updated);
                      }}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Paragraphs Edit (if Summary) */}
                {activeItem.details?.paragraphs && (
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      Summary Content Paragraphs
                    </label>
                    <div className="space-y-2">
                      {activeItem.details.paragraphs.map((p, pIdx) => (
                        <textarea
                          key={pIdx}
                          rows={2}
                          value={p}
                          onChange={(e) => {
                            const updatedParas = [...activeItem.details.paragraphs!];
                            updatedParas[pIdx] = e.target.value;
                            const updated = editingItems.map((i) =>
                              i.id === activeItem.id
                                ? { ...i, details: { ...i.details, paragraphs: updatedParas } }
                                : i
                            );
                            setEditingItems(updated);
                          }}
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sections Edit (if Skills, Experience, Projects, Education) */}
                {activeItem.details?.sections && (
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      Section Content Blocks
                    </label>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {activeItem.details.sections.map((sec, sIdx) => (
                        <div key={sIdx} className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2">
                          <input
                            type="text"
                            value={sec.title}
                            placeholder="Block Title"
                            onChange={(e) => {
                              const updatedSections = [...activeItem.details.sections!];
                              updatedSections[sIdx] = { ...sec, title: e.target.value };
                              const updated = editingItems.map((i) =>
                                i.id === activeItem.id
                                  ? { ...i, details: { ...i.details, sections: updatedSections } }
                                  : i
                              );
                              setEditingItems(updated);
                            }}
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-white"
                          />
                          {sec.subtitle !== undefined && (
                            <input
                              type="text"
                              value={sec.subtitle}
                              placeholder="Subtitle / Dates"
                              onChange={(e) => {
                                const updatedSections = [...activeItem.details.sections!];
                                updatedSections[sIdx] = { ...sec, subtitle: e.target.value };
                                const updated = editingItems.map((i) =>
                                  i.id === activeItem.id
                                    ? { ...i, details: { ...i.details, sections: updatedSections } }
                                    : i
                                );
                                setEditingItems(updated);
                              }}
                              className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-neutral-400"
                            />
                          )}
                          {sec.text !== undefined && (
                            <textarea
                              rows={2}
                              value={sec.text}
                              placeholder="Content description"
                              onChange={(e) => {
                                const updatedSections = [...activeItem.details.sections!];
                                updatedSections[sIdx] = { ...sec, text: e.target.value };
                                const updated = editingItems.map((i) =>
                                  i.id === activeItem.id
                                    ? { ...i, details: { ...i.details, sections: updatedSections } }
                                    : i
                                );
                                setEditingItems(updated);
                              }}
                              className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-neutral-300"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-5 border-t border-white/10 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(false)}
                className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveToDb}
                disabled={isSaving}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save to Database
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ResumeDemo;
