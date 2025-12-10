"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FileText, Plus } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  folder_id: string | null;
}

interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

interface FolderViewProps {
  folder: Folder;
  notes: Note[];
}

export function FolderView({ folder, notes }: FolderViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleCreateNote = async () => {
    const { data, error } = await supabase
      .from("notes")
      .insert({
        title: "Untitled Note",
        content: "",
        user_id: folder.user_id,
        folder_id: folder.id,
      })
      .select()
      .single();

    if (!error && data) {
      router.push(`/notes/${data.id}`);
      router.refresh();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-memo-text">{folder.name}</h1>
            <p className="text-sm text-memo-textLight mt-1">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-2 px-4 py-2 bg-memo-wood text-white text-sm font-medium rounded-lg hover:bg-memo-woodDark transition"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-memo-line mx-auto mb-4" />
            <p className="text-memo-textLight">No notes in this folder yet.</p>
            <button
              onClick={handleCreateNote}
              className="mt-4 text-memo-wood hover:underline font-medium"
            >
              Create your first note
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                className="text-left p-4 bg-white border border-memo-line rounded-lg hover:shadow-memo transition"
              >
                <h3 className="font-medium text-memo-text truncate">
                  {note.title || "Untitled"}
                </h3>
                <p className="text-sm text-memo-textLight mt-1 line-clamp-2">
                  {note.content.replace(/<[^>]*>/g, "").substring(0, 100) || "No content"}
                </p>
                <p className="text-xs text-memo-textLight mt-3">
                  {formatDate(note.updated_at)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
