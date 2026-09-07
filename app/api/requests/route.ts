import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

type CreateRequestBody = {
  client_id: string;
  document_name: string;
  deadline: string;
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { client_id, document_name, deadline } = (body ?? {}) as Partial<CreateRequestBody>;

  if (
    typeof client_id !== "string" ||
    client_id.trim() === "" ||
    typeof document_name !== "string" ||
    document_name.trim() === "" ||
    typeof deadline !== "string" ||
    deadline.trim() === "" ||
    Number.isNaN(Date.parse(deadline))
  ) {
    return NextResponse.json(
      { error: "client_id, document_name, and a valid deadline are required" },
      { status: 400 }
    );
  }

  const upload_link_token = randomUUID();

  const { data, error } = await supabase
    .from("document_requests")
    .insert({
      client_id,
      document_name,
      deadline: new Date(deadline).toISOString(),
      status: "pending",
      upload_link_token,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create document request:", error);
    return NextResponse.json(
      { error: "Failed to create document request" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
