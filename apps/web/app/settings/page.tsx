import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
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
        currentNoteId={null}
        user={user}
      />
      <main className="flex-1 flex flex-col overflow-hidden p-8">
        <SettingsForm user={user} />
      </main>
    </div>
  );
}
