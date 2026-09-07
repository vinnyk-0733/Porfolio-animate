"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Lock, Unlock, Eye, EyeOff, X, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onAccept: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  confirmDelete: (options: ConfirmDialogOptions) => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  login: async () => ({ success: false }),
  logout: () => {},
  openLoginModal: () => {},
  closeLoginModal: () => {},
  confirmDelete: () => {},
});

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    // Check localStorage first
    const localAuth = localStorage.getItem("portfolio_admin_auth");
    if (localAuth === "true") {
      setIsAdmin(true);
    }

    // Verify with API
    fetch("/api/auth")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setIsAdmin(true);
          localStorage.setItem("portfolio_admin_auth", "true");
        } else if (localAuth !== "true") {
          setIsAdmin(false);
        }
      })
      .catch(() => {});
  }, []);

  const login = async (pwd: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAdmin(true);
        localStorage.setItem("portfolio_admin_auth", "true");
        if (data.token) {
          localStorage.setItem("portfolio_admin_token", data.token);
        }
        setIsLoginModalOpen(false);
        setPassword("");
        return { success: true };
      } else {
        const errMsg = data.error || "Incorrect password";
        setError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.message || "Login request failed";
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setIsAdmin(false);
    localStorage.removeItem("portfolio_admin_auth");
    localStorage.removeItem("portfolio_admin_token");
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {}
  };

  const openLoginModal = () => {
    setError(null);
    setPassword("");
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setPassword("");
    setError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }
    await login(password);
  };

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmDialogOptions;
    isLoading: boolean;
  }>({
    isOpen: false,
    options: { onAccept: () => {} },
    isLoading: false,
  });

  const confirmDelete = (options: ConfirmDialogOptions) => {
    setConfirmState({
      isOpen: true,
      options,
      isLoading: false,
    });
  };

  const handleConfirmAccept = async () => {
    setConfirmState((prev) => ({ ...prev, isLoading: true }));
    try {
      await confirmState.options.onAccept();
      setConfirmState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    } catch (err) {
      console.error("Error executing confirmed action", err);
      setConfirmState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleConfirmCancel = () => {
    if (confirmState.options.onCancel) {
      confirmState.options.onCancel();
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        confirmDelete,
      }}
    >
      {children}

      {/* Floating Admin Mode Indicator (Top Center) */}
      {isAdmin && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/40 bg-black/80 backdrop-blur-md shadow-2xl text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Edit Mode Active
            </span>
            <span className="text-white/40">|</span>
            <span className="text-white/70 hidden sm:inline">Changes save directly to MongoDB</span>
            <button
              onClick={logout}
              className="ml-1 text-[11px] text-white/50 hover:text-white px-2 py-0.5 rounded-full hover:bg-white/10 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom-Right Admin Lock/Unlock Trigger */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <button
          onClick={isAdmin ? logout : openLoginModal}
          title={isAdmin ? "Edit Mode Active (Click to Log Out)" : "Admin Edit Mode"}
          className={`h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300 shadow-2xl ${
            isAdmin
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:scale-105 hover:bg-emerald-500/30"
              : "bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/20 hover:scale-105"
          }`}
        >
          {isAdmin ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/15 bg-neutral-950/90 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Admin Authentication</h3>
                <p className="text-xs text-neutral-400">Enter master password to enable edit mode</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    autoFocus
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeLoginModal}
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 flex items-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Unlock Edit Mode
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Deletion Confirmation Box with Cancel & Accept */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.options.title || "Confirm Deletion"}
        message={confirmState.options.message}
        itemName={confirmState.options.itemName}
        confirmText={confirmState.options.confirmText || "Accept"}
        cancelText={confirmState.options.cancelText || "Cancel"}
        isDangerous={confirmState.options.isDangerous ?? true}
        isLoading={confirmState.isLoading}
        onAccept={handleConfirmAccept}
        onCancel={handleConfirmCancel}
      />
    </AdminContext.Provider>
  );
}
