'use client'

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Pencil, X, Check, Plus, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { defaultProfile } from "@/lib/default-data";
import { useAdmin } from "@/context/admin-context";
import { Button } from "@/components/ui/button";

const CyberneticGridShader = dynamic(
  () => import("@/components/ui/cybernetic-grid-shader"),
  { ssr: false }
);

function Typewriter({ words }: { words: string[] }) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const currentWord = words[wordIndex % words.length];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }, 40);
    } else {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1));
        if (text.length === currentWord.length) {
          timeout = setTimeout(() => setIsDeleting(true), 2500);
        }
      }, 75);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <span className="inline-block">
      {text}
      <span className="animate-[pulse_1s_ease-in-out_infinite] opacity-70 ml-1">|</span>
    </span>
  );
}

export default function SplineSceneBasic() {
  const { isAdmin } = useAdmin();
  const [name, setName] = useState<string>(defaultProfile.name);
  const [words, setWords] = useState<string[]>(defaultProfile.typewriterWords);
  const [bio, setBio] = useState<string>(defaultProfile.bio);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editWords, setEditWords] = useState<string[]>(words);
  const [editBio, setEditBio] = useState(bio);
  const [newPhrase, setNewPhrase] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.name) setName(data.name);
          if (Array.isArray(data.typewriterWords) && data.typewriterWords.length > 0) {
            setWords(data.typewriterWords);
          }
          if (data.bio) setBio(data.bio);
        }
      })
      .catch((err) => console.warn("Could not fetch profile, using fallback", err));
  }, []);

  const handleOpenEdit = () => {
    setEditName(name);
    setEditWords([...words]);
    setEditBio(bio);
    setNewPhrase("");
    setIsModalOpen(true);
  };

  const handleAddPhrase = () => {
    if (newPhrase.trim()) {
      setEditWords([...editWords, newPhrase.trim()]);
      setNewPhrase("");
    }
  };

  const handleRemovePhrase = (index: number) => {
    setEditWords(editWords.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: editName,
        typewriterWords: editWords,
        heroTypewriterWords: editWords,
        bio: editBio,
        heroBio: editBio,
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setName(editName);
        setWords(editWords);
        setBio(editBio);
        setIsModalOpen(false);
      } else {
        alert("Failed to save changes to database.");
      }
    } catch (err) {
      alert("Error connecting to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex items-center p-6 sm:p-12 md:p-24">
      {/* Cybernetic Grid Background */}
      <div className="absolute inset-0 z-0">
        <CyberneticGridShader maxDpr={1} pauseOffscreen />
      </div>

      {/* Front Interface */}
      <div className="relative z-10 w-full max-w-3xl pointer-events-none mt-20">
        <div className="flex items-center gap-3 absolute -top-24 left-0 z-20 pointer-events-auto">
          <Link
            href="/"
            className="text-white/50 hover:text-white transition-colors inline-flex items-center gap-2 text-sm backdrop-blur-md bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-xl"
          >
            <ArrowLeft size={16} /> Back to Resume
          </Link>

          {isAdmin && (
            <Button
              onClick={handleOpenEdit}
              size="sm"
              className="rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs gap-1.5 shadow-xl backdrop-blur-md px-4 py-2"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          )}
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 min-h-[3em] sm:min-h-[2em] lg:min-h-[2.5em] flex items-center font-sans tracking-tight drop-shadow-lg">
          <Typewriter words={words} />
        </h1>
        <p className="mt-4 text-neutral-300 max-w-xl text-lg md:text-xl leading-relaxed backdrop-blur-sm bg-black/40 p-6 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto relative">
          {bio}
        </p>
      </div>

      {/* Profile Edit Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md pointer-events-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-neutral-950/95 p-6 text-white shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Pencil className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Edit Profile Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Typewriter Cycling Phrases
                </label>
                <div className="space-y-2 mb-2">
                  {editWords.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={w}
                        onChange={(e) => {
                          const updated = [...editWords];
                          updated[idx] = e.target.value;
                          setEditWords(updated);
                        }}
                        className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhrase(idx)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPhrase}
                    onChange={(e) => setNewPhrase(e.target.value)}
                    placeholder="Add new phrase..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPhrase();
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddPhrase}
                    className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Bio Description</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 border-t border-white/10 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs gap-1.5"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Save to Database
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
