import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { NoteEditor } from "@/components/NoteEditor";

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !note) {
    notFound();
  }

  const { data: notes } = await supabase
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
        notes={notes || []} 
        folders={folders || []} 
        currentNoteId={id}
        user={user}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <NoteEditor note={note} />
      </main>
    </div>
  );
}
