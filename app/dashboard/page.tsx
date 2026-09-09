import { supabase } from "@/lib/supabase";

import AppShell from "@/components/app-shell";

import DashboardClient, { type ClientOption, type DashboardRequest } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: rows, error } = await supabase
    .from("document_requests")
    .select("*, clients(name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load document requests:", error);
  }

  const { data: clientRows, error: clientsError } = await supabase
    .from("clients")
    .select("id, name")
    .order("name", { ascending: true });

  if (clientsError) {
    console.error("Failed to load clients:", clientsError);
  }

  const clients: ClientOption[] = (clientRows ?? []).map((client) => ({
    id: String(client.id),
    name: String(client.name),
  }));

  const requests: DashboardRequest[] = [];

  for (const row of rows ?? []) {
    let downloadUrl: string | null = null;

    if (row.status === "uploaded" && typeof row.upload_path === "string") {
      const { data: signedUrlData } = await supabase.storage
        .from("documents")
        .createSignedUrl(row.upload_path, 3600);
      downloadUrl = signedUrlData?.signedUrl ?? null;
    }

    requests.push({
      id: row.id,
      clientName: row.clients?.name ?? null,
      clientEmail: row.clients?.email ?? null,
      documentName: row.document_name,
      deadline: typeof row.deadline === "string" ? row.deadline : null,
      status: row.status,
      downloadUrl,
      rejectionReason: row.rejection_reason ?? null,
    });
  }

  return (
    <AppShell>
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 backdrop-blur-sm ring-1 ring-inset ring-red-500/10 dark:text-red-300">
          Failed to load document requests. Please check the database setup.
        </div>
      )}
      <DashboardClient requests={requests} clients={clients} />
    </AppShell>
  );
}