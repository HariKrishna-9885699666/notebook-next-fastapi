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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [folderOptions, setFolderOptions] = useState<{ id: string; name: string }[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [foldersError, setFoldersError] = useState<string | null>(null);
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

  // Broadcast title changes so sidebar can stay in sync without reload
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("note-title-updated", {
          detail: { id: note.id, title },
        })
      );
    }
  }, [title, note.id]);

  const handleDelete = async () => {
    await supabase.from("notes").delete().eq("id", note.id);
    router.push("/");
    router.refresh();
  };

  const loadFoldersAndOpen = async () => {
    setFoldersLoading(true);
    setFoldersError(null);
    const { data: folders, error } = await supabase
      .from("folders")
      .select("id, name")
      .eq("user_id", note.user_id);

    if (error) {
      setFoldersError("Could not load folders. Try again.");
      setFoldersLoading(false);
      return;
    }

    setFolderOptions(folders ?? []);
    setFoldersLoading(false);
    setShowMoveModal(true);
  };

  const handleMoveToFolder = async (folderId: string | null) => {
    await supabase.from("notes").update({ folder_id: folderId }).eq("id", note.id);
    router.refresh();
    setShowMoveModal(false);
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
    <>
      <div
        className={`flex flex-col h-full ${
          isFullscreen ? "fixed inset-0 z-[1050] bg-white shadow-lg" : ""
        }`}
        style={isFullscreen ? { top: 0, left: 0, right: 0, bottom: 0 } : undefined}
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
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-memo-line rounded-lg shadow-memo py-1 z-11">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    loadFoldersAndOpen();
                  }}
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
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
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

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1059 }} />
          <div
            className="modal d-block"
            style={{ zIndex: 1060 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg rounded-3 border-0">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-semibold">Delete this note?</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowDeleteConfirm(false)}
                  />
                </div>
                <div className="modal-body pt-0">
                  <p className="text-muted mb-0">This action cannot be undone.</p>
                </div>
                <div className="modal-footer border-0 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-50"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger w-50"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Move to folder modal */}
      {showMoveModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1059 }} />
          <div
            className="modal d-block"
            style={{ zIndex: 1060 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg rounded-3 border-0">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-semibold">Move to folder</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowMoveModal(false)}
                  />
                </div>
                <div className="modal-body">
                  {foldersLoading && <p className="text-muted mb-0">Loading folders...</p>}
                  {foldersError && <p className="text-danger mb-0">{foldersError}</p>}

                  {!foldersLoading && !foldersError && (
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleMoveToFolder(null)}
                      >
                        No folder
                      </button>
                      {folderOptions.length === 0 && (
                        <p className="text-muted mb-0 text-center">No folders yet.</p>
                      )}
                      {folderOptions.map((folder) => (
                        <button
                          key={folder.id}
                          className="btn btn-light border text-start"
                          onClick={() => handleMoveToFolder(folder.id)}
                        >
                          {folder.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setShowMoveModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
