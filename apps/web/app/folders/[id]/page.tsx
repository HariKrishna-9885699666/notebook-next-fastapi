import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { FolderView } from "@/components/FolderView";

interface FolderPageProps {
  params: Promise<{ id: string }>;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: folder, error } = await supabase
    .from("folders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !folder) {
    notFound();
  }

  const { data: folderNotes } = await supabase
    .from("notes")
    .select("id, title, content, created_at, updated_at, folder_id")
    .eq("user_id", user.id)
    .eq("folder_id", id)
    .order("updated_at", { ascending: false });

  const { data: allNotes } = await supabase
    .from("notes")
    .select("id, title, content, created_at, updated_at, folder_id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const { data: folders } = await supabase
    .from("folders")
    .select("id, name, created_at")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  return (
    <div className="flex h-screen overflow-hidden bg-memo-paper">
      <Sidebar 
        notes={allNotes || []} 
        folders={folders || []} 
        currentNoteId={null}
        currentFolderId={id}
        user={user}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <FolderView folder={folder} notes={folderNotes || []} />
      </main>
    </div>
  );
}
