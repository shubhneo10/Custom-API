import EndpointExplorer from "@/components/EndpointExplorer";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-16 font-sans">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">API Endpoints</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Select an endpoint to see its curl command.
        </p>
      </header>
      <EndpointExplorer />
    </main>
  );
}
