import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupaNote - Modern Notes App",
  description: "A beautiful notes app with rich text editing, image support, and cloud sync",
  keywords: ["notes", "notepad", "memo", "rich text editor", "supabase"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
