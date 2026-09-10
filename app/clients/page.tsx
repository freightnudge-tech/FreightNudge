import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import ClientsClient from "./clients-client";

export const metadata: Metadata = {
  title: "Clients - FreightNudge",
};

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { forwarder } = await requireAuth(supabase);

  if (!forwarder) {
    redirect("/settings");
  }

  const [clientsRes, requestsRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, email, forwarder_id")
      .eq("forwarder_id", forwarder.id)
      .order("name", { ascending: true }),
    supabase
      .from("document_requests")
      .select("id, client_id, status, clients(forwarder_id)")
      .eq("clients.forwarder_id", forwarder.id),
  ]);

  if (clientsRes.error) {
    console.error("Failed to load clients:", clientsRes.error);
  }
  if (requestsRes.error) {
    console.error("Failed to load request counts:", requestsRes.error);
  }

  const forwarderNames = new Map<string, string>([[forwarder.id, forwarder.name]]);

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

  const forwarders = [{ id: forwarder.id, name: forwarder.name }];

  return (
    <ClientsClient
      clients={clients}
      forwarders={forwarders}
      requestsTotal={(requestsRes.data ?? []).length}
      pendingCount={pendingCount}
      loadError={Boolean(clientsRes.error)}
      isAdmin={forwarder?.isAdmin ?? false}
      account={forwarder ? { name: forwarder.displayName ?? forwarder.name, email: forwarder.email } : undefined}
    />
  );
}