"use client";

import { useState, useSyncExternalStore } from "react";
import { buildCurl, endpoints } from "@/lib/endpoints";

const FALLBACK_BASE_URL = "https://custom-api-theta.vercel.app";

const subscribe = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => FALLBACK_BASE_URL;

export default function EndpointExplorer() {
  const baseUrl = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);
  const [selectedId, setSelectedId] = useState(endpoints[0].id);
  const [copied, setCopied] = useState(false);

  const selected = endpoints.find((e) => e.id === selectedId) ?? endpoints[0];
  const curl = buildCurl(selected, baseUrl);

  async function copy() {
    await navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid w-full gap-6 md:grid-cols-[320px_1fr]">
      <ul className="flex flex-col gap-2">
        {endpoints.map((e) => (
          <li key={e.id}>
            <button
              onClick={() => {
                setSelectedId(e.id);
                setCopied(false);
              }}
              className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                e.id === selected.id
                  ? "border-black bg-black/[.04] dark:border-white dark:bg-white/[.08]"
                  : "border-black/[.1] hover:bg-black/[.03] dark:border-white/[.15] dark:hover:bg-white/[.05]"
              }`}
            >
              <span
                className={`mr-2 rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${
                  e.method === "GET"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {e.method}
              </span>
              <span className="font-mono text-sm break-all">
                {e.path.split("?")[0]}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <section className="flex flex-col gap-4 rounded-lg border border-black/[.1] p-5 dark:border-white/[.15]">
        <div>
          <h2 className="font-mono text-lg font-semibold break-all">
            {selected.method} {selected.path.split("?")[0]}
          </h2>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {selected.description}
          </p>
        </div>
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 pr-20 font-mono text-sm text-zinc-100">
            {curl}
          </pre>
          <button
            onClick={copy}
            className="absolute top-3 right-3 rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </section>
    </div>
  );
}
