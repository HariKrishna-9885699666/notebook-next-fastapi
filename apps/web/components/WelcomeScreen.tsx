"use client";

import { FileText, Plus } from "lucide-react";

interface WelcomeScreenProps {
  userName: string;
}

export function WelcomeScreen({ userName }: WelcomeScreenProps) {
  return (
    <div className="text-center max-w-md px-4">
      <div className="w-20 h-20 bg-memo-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <FileText className="w-10 h-10 text-memo-wood" />
      </div>
      <h1 className="text-2xl font-bold text-memo-text mb-2">
        Welcome, {userName}!
      </h1>
      <p className="text-memo-textLight mb-8">
        Select a note from the sidebar or create a new one to get started.
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-memo-textLight">
        <Plus className="w-4 h-4" />
        <span>Click &quot;New Note&quot; in the sidebar</span>
      </div>
    </div>
  );
}
