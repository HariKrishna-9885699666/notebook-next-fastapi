// Note types
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  title: string;
  content?: string;
  folder_id?: string | null;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  folder_id?: string | null;
}

export type NoteListItem = Pick<
  Note,
  "id" | "title" | "content" | "folder_id" | "created_at" | "updated_at"
>;

// Folder types
export interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface FolderCreate {
  name: string;
}

export interface FolderUpdate {
  name?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Upload types
export interface UploadResponse {
  url: string;
  path: string;
}

// Editor types
export type SaveStatus = "saved" | "saving" | "unsaved";

export interface EditorState {
  title: string;
  content: string;
  saveStatus: SaveStatus;
}
