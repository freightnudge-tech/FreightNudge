"use client";

import { useRef, useState } from "react";

import { supabase } from "@/lib/supabase";

type UploadFormProps = {
  requestId: string;
};

export default function UploadForm({ requestId }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setError(null);
    setSuccessMessage(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a file to upload first.");
      return;
    }

    // Replace unsafe characters in the file name to keep them valid for storage.
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `document-requests/${requestId}/${Date.now()}-${safeFileName}`;

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message ?? "Failed to upload the document.");
      }

      const { error: updateError } = await supabase
        .from("document_requests")
        .update({ status: "uploaded", upload_path: storagePath })
        .eq("id", requestId);

      if (updateError) {
        throw new Error(updateError.message ?? "Failed to update the request status.");
      }

      setSuccessMessage("Your document has been uploaded successfully. Thank you!");
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h2 className="text-lg font-semibold">Upload your document</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Select the document requested above and click upload. It will be stored securely for the forwarder.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-200 dark:hover:file:bg-zinc-700"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !file}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

      {file && !uploading && (
        <p className="mt-3 text-sm text-zinc-500">
          Selected file: <span className="font-medium text-zinc-700 dark:text-zinc-200">{file.name}</span>
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {successMessage && (
        <div className="mt-3 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          <p className="font-semibold">Upload successful</p>
          <p className="mt-1">{successMessage}</p>
        </div>
      )}
    </div>
  );
}