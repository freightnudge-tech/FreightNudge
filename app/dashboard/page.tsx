import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import DashboardConsole, { type ClientOption, type DashboardRequest } from "./dashboard-console";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { forwarder } = await requireAuth(supabase);

  if (!forwarder) {
    redirect("/settings");
  }

  const { data: rows, error } = await supabase
    .from("document_requests")
    .select("*, clients(name, email)")
    .eq("clients.forwarder_id", forwarder.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load document requests:", error);
  }

  const { data: clientRows, error: clientsError } = await supabase
    .from("clients")
    .select("id, name")
    .eq("forwarder_id", forwarder.id)
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
      shipmentId: row.shipment_id ?? null,
      containerNumber: row.container_number ?? null,
      blNumber: row.bl_number ?? null,
      route: row.route ?? null,
    });
  }

  return (
    <DashboardConsole
      requests={requests}
      clients={clients}
      loadError={Boolean(error)}
      isAdmin={forwarder?.isAdmin ?? false}
      account={forwarder ? { name: forwarder.displayName ?? forwarder.name, email: forwarder.email } : undefined}
    />
  );
}