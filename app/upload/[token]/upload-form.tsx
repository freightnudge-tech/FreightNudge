"use client";

import { useRef, useState } from "react";

import { supabase } from "@/lib/supabase";

type UploadFormProps = {
  requestId: string;
  token: string;
};

export default function UploadForm({ requestId, token }: UploadFormProps) {
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

      // Submit is token-matched (SECURITY DEFINER RPC): the status flip only
      // succeeds for the request this upload link points at, and only from
      // pending/expired. There is deliberately no anonymous UPDATE policy on
      // the document_requests table itself.
      const { error: submitError } = await supabase.rpc("submit_upload", {
        p_token: token,
        p_file_path: storagePath,
      });

      if (submitError) {
        throw new Error(submitError.message ?? "Failed to update the request status.");
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
    <div className="fn-upload-divider">
      <h2 className="fn-card-title">Upload your document</h2>
      <p className="fn-card-sub">
        Select the document requested above and click upload. It will be stored securely for the forwarder.
      </p>

      <div className="fn-actions-row">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="fn-input file:mr-3 file:rounded file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:bg-[#1e1b4b] file:text-[#a5b4fc] hover:file:bg-[#312e81]"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !file}
          className="cta"
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

      {file && !uploading && (
        <p className="channel mt-3">
          Selected file: <span className="fn-truncate">{file.name}</span>
        </p>
      )}

      {error && (
        <p className="fn-banner-error mt-3">
          {error}
        </p>
      )}

      {successMessage && (
        <div className="fn-banner-success mt-3">
          <p className="fn-success-head">Upload successful</p>
          <p className="mt-1">{successMessage}</p>
        </div>
      )}
    </div>
  );
}