"use client";

import { FileText } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  folder_id: string | null;
}

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

export function NoteCard({ note, isActive, onClick }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getPreview = (content: string) => {
    // Strip HTML tags and get first 50 characters
    const text = content.replace(/<[^>]*>/g, "").trim();
    return text.substring(0, 50) + (text.length > 50 ? "..." : "");
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg transition
        ${
          isActive
            ? "bg-memo-accent/20 border border-memo-accent"
            : "hover:bg-memo-paper border border-transparent"
        }
      `}
    >
      <div className="flex items-start gap-2">
        <FileText className={`w-4 h-4 mt-0.5 ${isActive ? "text-memo-wood" : "text-memo-textLight"}`} />
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-medium truncate ${
              isActive ? "text-memo-wood" : "text-memo-text"
            }`}
          >
            {note.title || "Untitled"}
          </h3>
          <p className="text-xs text-memo-textLight truncate mt-0.5">
            {getPreview(note.content) || "No content"}
          </p>
          <p className="text-xs text-memo-textLight mt-1">
            {formatDate(note.updated_at)}
          </p>
        </div>
      </div>
    </button>
  );
}
