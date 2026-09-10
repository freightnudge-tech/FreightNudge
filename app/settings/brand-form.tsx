"use client";

import { useRef, useState } from "react";

import { supabase } from "@/lib/supabase";

import { saveBranding } from "./actions";

type BrandFormProps = {
  forwarderId: string;
  accountName: string;
  contactEmail: string;
  displayName: string | null;
  logoPath: string | null;
};

const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/svg+xml,image/webp";

export default function BrandForm({
  forwarderId,
  accountName,
  contactEmail,
  displayName,
  logoPath,
}: BrandFormProps) {
  const [displayNameValue, setDisplayNameValue] = useState(displayName || accountName);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentLogoUrl = logoPath
    ? supabase.storage.from("branding").getPublicUrl(logoPath).data.publicUrl
    : null;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
    setSuccess(false);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      let nextLogoPath: string | null = logoPath;

      if (selectedFile) {
        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const extension = safeName.split(".").pop()?.toLowerCase() || "png";
        const storagePath = `forwarders/${forwarderId}/logo.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("branding")
          .upload(storagePath, selectedFile, { upsert: true });

        if (uploadError) {
          throw new Error(uploadError.message ?? "Failed to upload the logo.");
        }

        nextLogoPath = storagePath;
      }

      const result = await saveBranding({
        displayName: displayNameValue,
        logoPath: nextLogoPath,
      });

      if (!result.ok) {
        throw new Error(result.error ?? "Failed to save branding.");
      }

      setSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
    >
      <div className="fn-field mt-4">
        <span className="fn-field-label">Company logo</span>
        <div className="fn-logo-row">
          <div className="fn-logo-preview">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="New logo preview" className="fn-logo-img" />
            ) : currentLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentLogoUrl} alt={`${accountName} logo`} className="fn-logo-img" />
            ) : (
              <span className="brand-mark">{accountName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="fn-logo-actions">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              onChange={handleFileChange}
              disabled={saving}
              className="fn-input file:mr-3 file:rounded file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:bg-[#1e1b4b] file:text-[#a5b4fc] hover:file:bg-[#312e81]"
            />
            <span className="fn-field-hint">PNG, JPG, SVG or WebP. Max 5 MB.</span>
          </div>
        </div>
      </div>

      <div className="fn-field">
        <label htmlFor="settings-display-name">Display name</label>
        <input
          id="settings-display-name"
          type="text"
          value={displayNameValue}
          onChange={(event) => {
            setDisplayNameValue(event.target.value);
            setError(null);
            setSuccess(false);
          }}
          placeholder={accountName}
          disabled={saving}
          className="fn-input"
        />
        <span className="fn-field-hint">Shown to clients on upload pages. Defaults to your account name.</span>
      </div>

      <div className="fn-field">
        <label htmlFor="settings-brand-email">Contact email</label>
        <input id="settings-brand-email" type="email" defaultValue={contactEmail} className="fn-input" disabled />
      </div>

      {error && <p className="fn-banner-error">{error}</p>}

      {success && (
        <div className="fn-banner-success mt-3">
          <p className="fn-success-head">Branding saved</p>
          <p className="mt-1">Your logo and display name will appear on all client upload pages.</p>
        </div>
      )}

      <button type="submit" className="cta mt-5" disabled={saving}>
        {saving ? "Saving..." : "Save account settings"}
      </button>
    </form>
  );
}