"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Plus,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Menu,
  X,
} from "lucide-react";
import { NoteCard } from "./NoteCard";

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
  created_at: string;
}

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  currentNoteId: string | null;
  currentFolderId?: string;
  user: User;
}

export function Sidebar({ notes, folders, currentNoteId, currentFolderId, user }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderError, setFolderError] = useState<string | null>(null);
  const [folderSaving, setFolderSaving] = useState(false);
  const [notesState, setNotesState] = useState<Note[]>(notes);
  const router = useRouter();
  const supabase = createClient();

  // Listen for title updates from the editor to keep the list in sync without reload
  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ id: string; title: string }>;
      const { id, title } = custom.detail || {};
      if (!id) return;
      setNotesState((prev) =>
        prev.map((n) => (n.id === id ? { ...n, title } : n))
      );
    };
    window.addEventListener("note-title-updated", handler as EventListener);
    return () => window.removeEventListener("note-title-updated", handler as EventListener);
  }, []);

  const filteredNotes = notesState.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unorganizedNotes = filteredNotes.filter((note) => !note.folder_id);
  const getNotesByFolder = (folderId: string) =>
    filteredNotes.filter((note) => note.folder_id === folderId);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateNote = async () => {
    const { data, error } = await supabase
      .from("notes")
      .insert({
        title: "Untitled Note",
        content: "",
        user_id: user.id,
        folder_id: currentFolderId || null,
      })
      .select()
      .single();

    if (!error && data) {
      router.push(`/notes/${data.id}`);
      router.refresh();
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setFolderError("Folder name is required");
      return;
    }

    setFolderSaving(true);
    setFolderError(null);

    const { error } = await supabase.from("folders").insert({
      name: folderName.trim(),
      user_id: user.id,
    });

    if (error) {
      setFolderError(error.message || "Unable to create folder");
      setFolderSaving(false);
      return;
    }

    setFolderName("");
    setFolderSaving(false);
    setShowFolderModal(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-memo-wood text-white rounded-lg shadow-memo"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40 h-full w-72 bg-white border-r border-memo-line
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-memo-line">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-memo-wood" />
            <span className="text-xl font-bold text-memo-wood">SupaNote</span>
          </Link>

          {/* Search */}
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-memo-line">
              <Search className="text-secondary" size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="form-control border-memo-line text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-2">
          <button
            onClick={handleCreateNote}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-memo-wood text-white text-sm font-medium rounded-lg hover:bg-memo-woodDark transition"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
          <button
            onClick={() => {
              setFolderName("");
              setFolderError(null);
              setShowFolderModal(true);
            }}
            className="p-2 border border-memo-line rounded-lg hover:bg-memo-paper transition"
            title="New Folder"
          >
            <FolderOpen className="w-5 h-5 text-memo-textLight" />
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Folders */}
          {folders.map((folder) => (
            <div key={folder.id}>
              <button
                onClick={() => toggleFolder(folder.id)}
                className={`
                  w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm font-medium
                  ${currentFolderId === folder.id ? "bg-memo-accent/20 text-memo-wood" : "hover:bg-memo-paper text-memo-text"}
                  transition
                `}
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    expandedFolders.has(folder.id) ? "rotate-90" : ""
                  }`}
                />
                <FolderOpen className="w-4 h-4" />
                <span className="flex-1 truncate">{folder.name}</span>
                <span className="text-xs text-memo-textLight">
                  {getNotesByFolder(folder.id).length}
                </span>
              </button>
              {expandedFolders.has(folder.id) && (
                <div className="ml-6 mt-1 space-y-1">
                  {getNotesByFolder(folder.id).map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isActive={note.id === currentNoteId}
                      onClick={() => {
                        router.push(`/notes/${note.id}`);
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Unorganized Notes */}
          {unorganizedNotes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-memo-textLight uppercase tracking-wide mb-2">
                Notes
              </p>
              <div className="space-y-1">
                {unorganizedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isActive={note.id === currentNoteId}
                    onClick={() => {
                      router.push(`/notes/${note.id}`);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredNotes.length === 0 && (
            <p className="text-center text-sm text-memo-textLight py-8">
              {searchQuery ? "No notes found" : "No notes yet. Create one!"}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-memo-line">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-memo-accent/30 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-memo-wood">
                {user.email?.[0].toUpperCase()}
              </span>
            </div>
            <span className="flex-1 text-sm text-memo-text truncate">
              {user.email}
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              href="/settings"
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-memo-textLight hover:text-memo-text border border-memo-line rounded-lg hover:bg-memo-paper transition"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-memo-textLight hover:text-red-500 border border-memo-line rounded-lg hover:bg-red-50 hover:border-red-200 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Create Folder Modal */}
      {showFolderModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1059 }} />
          <div className="modal d-block" style={{ zIndex: 1060 }} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg rounded-3 border-0">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-semibold">Create folder</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowFolderModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <label className="form-label fw-semibold">Folder name</label>
                  <input
                    type="text"
                    className={`form-control ${folderError ? "is-invalid" : ""}`}
                    value={folderName}
                    onChange={(e) => {
                      setFolderName(e.target.value);
                      setFolderError(null);
                    }}
                    placeholder="e.g. School, Work"
                    autoFocus
                  />
                  {folderError && <div className="invalid-feedback d-block">{folderError}</div>}
                </div>
                <div className="modal-footer border-0 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-50"
                    onClick={() => setShowFolderModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary w-50 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleCreateFolder}
                    disabled={folderSaving}
                  >
                    {folderSaving && <span className="spinner-border spinner-border-sm" />}
                    Create
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
