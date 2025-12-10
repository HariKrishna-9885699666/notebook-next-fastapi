"use client";

import { Check, Loader2, AlertCircle } from "lucide-react";

interface AutoSaveIndicatorProps {
  status: "saved" | "saving" | "unsaved";
}

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === "saved" && (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {status === "saving" && (
        <>
          <Loader2 className="w-3.5 h-3.5 text-memo-textLight animate-spin" />
          <span className="text-memo-textLight">Saving...</span>
        </>
      )}
      {status === "unsaved" && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-amber-600">Unsaved</span>
        </>
      )}
    </div>
  );
}
