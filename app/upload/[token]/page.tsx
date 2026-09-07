export default async function UploadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  // TODO: Client-facing document upload page, resolved via the request token.
  const { token } = await params;

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">Upload Document</h1>
      <p className="mt-2 text-zinc-500">Upload form for request token: {token}</p>
    </div>
  );
}
