import type { Metadata } from "next";

import { supabase } from "@/lib/supabase";

import ClientsClient from "./clients-client";

export const metadata: Metadata = {
  title: "Clients - FreightNudge",
};

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [clientsRes, forwardersRes, requestsRes] = await Promise.all([
    supabase.from("clients").select("id, name, email, forwarder_id").order("name", { ascending: true }),
    supabase.from("forwarders").select("id, name").order("name", { ascending: true }),
    supabase.from("document_requests").select("id, client_id, status"),
  ]);

  if (clientsRes.error) {
    console.error("Failed to load clients:", clientsRes.error);
  }
  if (forwardersRes.error) {
    console.error("Failed to load forwarders:", forwardersRes.error);
  }
  if (requestsRes.error) {
    console.error("Failed to load request counts:", requestsRes.error);
  }

  const forwarderNames = new Map<string, string>();
  for (const forwarder of forwardersRes.data ?? []) {
    forwarderNames.set(String(forwarder.id), String(forwarder.name));
  }

  const requestCounts = new Map<string, number>();
  let pendingCount = 0;
  for (const request of requestsRes.data ?? []) {
    const key = String(request.client_id);
    requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1);
    if (request.status === "pending") {
      pendingCount += 1;
    }
  }

  const clients = (clientsRes.data ?? []).map((client) => ({
    id: String(client.id),
    name: String(client.name),
    email: String(client.email),
    forwarderName: forwarderNames.get(String(client.forwarder_id)) ?? "Unassigned",
    requestCount: requestCounts.get(String(client.id)) ?? 0,
  }));

  const forwarders = (forwardersRes.data ?? []).map((forwarder) => ({
    id: String(forwarder.id),
    name: String(forwarder.name),
  }));

  return (
    <ClientsClient
      clients={clients}
      forwarders={forwarders}
      requestsTotal={(requestsRes.data ?? []).length}
      pendingCount={pendingCount}
      loadError={Boolean(clientsRes.error)}
    />
  );
}