import Image from "next/image";

export default function Home() {
  return (
    <div className="fn-shell fn-stack">
      <main className="fn-center">
        <div className="fn-card" style={{ maxWidth: 560, width: "100%" }}>
          <Image
            className="h-5 w-[100px]"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <h1 className="fn-card-title" style={{ marginTop: 18 }}>
            To get started, edit the <code className="shipment-id">page.tsx</code> file.
          </h1>
          <p className="fn-card-sub" style={{ marginTop: 10 }}>
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              className="fn-link-btn"
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              className="fn-link-btn"
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            >
              Learning
            </a>{" "}
            center.
          </p>
          <div className="fn-actions-row">
            <a
              className="cta"
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image className="h-[14px] w-4" src="/vercel.svg" alt="Vercel logomark" width={16} height={14} />
              Deploy Now
            </a>
            <a
              className="fn-btn-ghost"
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
