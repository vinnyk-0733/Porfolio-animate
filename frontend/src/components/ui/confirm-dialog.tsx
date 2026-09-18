"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this? This action will immediately update your database and cannot be undone.",
  itemName,
  confirmText = "Accept",
  cancelText = "Cancel",
  isDangerous = true,
  isLoading = false,
  onAccept,
  onCancel,
}: ConfirmDialogProps) {
  // Handle ESC and Enter key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-neutral-950 p-5 sm:p-6 text-white shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Banner */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
              isDangerous
                ? "bg-red-500/15 border border-red-500/30 text-red-400 shadow-red-500/10"
                : "bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-amber-500/10"
            }`}
          >
            {isDangerous ? (
              <Trash2 className="w-7 h-7 animate-pulse" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white mb-2">
            {title}
          </h3>

          {itemName && (
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-mono text-neutral-200 max-w-full truncate mb-2.5">
              &ldquo;{itemName}&rdquo;
            </div>
          )}

          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm mb-6">
            {message}
          </p>
        </div>

        {/* Action Buttons: Cancel and Accept */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-sm py-2.5 transition-all"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            onClick={onAccept}
            disabled={isLoading}
            className={`w-full rounded-xl font-semibold text-sm py-2.5 transition-all shadow-lg ${
              isDangerous
                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/20"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-emerald-500/20"
            }`}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Deleting...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
