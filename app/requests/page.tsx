import type { Metadata } from "next";

import { supabase } from "@/lib/supabase";
import type { DashboardRequest } from "@/components/request-row";

import RequestsClient from "./requests-client";

export const metadata: Metadata = {
  title: "Requests - FreightNudge",
};

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const { data: rows, error } = await supabase
    .from("document_requests")
    .select("*, clients(name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load document requests:", error);
  }

  const { data: clientRows } = await supabase.from("clients").select("id");

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
    <RequestsClient
      requests={requests}
      clientsCount={(clientRows ?? []).length}
      loadError={Boolean(error)}
    />
  );
}