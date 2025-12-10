"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Toolbar } from "./Toolbar";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { Editor } from "./Editor";
import { Trash2, FolderOpen, MoreHorizontal } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  folder_id: string | null;
  user_id: string;
}

interface NoteEditorProps {
  note: Note;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showMenu, setShowMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Debounced save function
  const saveNote = useCallback(
    async (newTitle: string, newContent: string) => {
      setSaveStatus("saving");
      const { error } = await supabase
        .from("notes")
        .update({
          title: newTitle,
          content: newContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", note.id);

      if (!error) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("unsaved");
      }
    },
    [note.id, supabase]
  );

  // Auto-save with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        saveNote(title, content);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, content, note.title, note.content, saveNote]);

  // Mark as unsaved when content changes
  useEffect(() => {
    if (title !== note.title || content !== note.content) {
      setSaveStatus("unsaved");
    }
  }, [title, content, note.title, note.content]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    await supabase.from("notes").delete().eq("id", note.id);
    router.push("/");
    router.refresh();
  };

  const handleMoveToFolder = async () => {
    const { data: folders } = await supabase
      .from("folders")
      .select("id, name")
      .eq("user_id", note.user_id);

    if (!folders || folders.length === 0) {
      alert("No folders available. Create a folder first.");
      return;
    }

    const folderList = folders.map((f, i) => `${i + 1}. ${f.name}`).join("\n");
    const choice = prompt(`Select folder number:\n0. No folder\n${folderList}`);
    
    if (choice === null) return;
    
    const choiceNum = parseInt(choice);
    const folderId = choiceNum === 0 ? null : folders[choiceNum - 1]?.id;

    if (choiceNum !== 0 && !folderId) {
      alert("Invalid selection");
      return;
    }

    await supabase
      .from("notes")
      .update({ folder_id: folderId })
      .eq("id", note.id);

    router.refresh();
    setShowMenu(false);
  };

  // Handle image upload from editor
  const handleImageUpload = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${note.user_id}/${note.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("note-images")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("note-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  return (
    <div
      className={`flex flex-col h-full ${isFullscreen ? "fixed inset-0 z-50 bg-memo-paper" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-memo-line bg-white">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="flex-1 text-xl font-semibold bg-transparent border-none focus:outline-none text-memo-text placeholder-memo-textLight"
        />
        <div className="flex items-center gap-2">
          <AutoSaveIndicator status={saveStatus} />
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-memo-paper rounded-lg transition"
            >
              <MoreHorizontal className="w-5 h-5 text-memo-textLight" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-memo-line rounded-lg shadow-memo py-1 z-10">
                <button
                  onClick={handleMoveToFolder}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-memo-text hover:bg-memo-paper transition"
                >
                  <FolderOpen className="w-4 h-4" />
                  Move to folder
                </button>
                <button
                  onClick={() => {
                    setIsFullscreen(!isFullscreen);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-memo-text hover:bg-memo-paper transition"
                >
                  {isFullscreen ? "Exit fullscreen" : "Fullscreen mode"}
                </button>
                <hr className="my-1 border-memo-line" />
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Editor
          content={content}
          onChange={setContent}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  );
}
