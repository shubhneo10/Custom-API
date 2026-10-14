export type Endpoint = {
  id: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  body?: Record<string, unknown>;
};

export const endpoints: Endpoint[] = [
  {
    id: "test",
    method: "GET",
    path: "/api/test",
    description: "Health-check style endpoint that returns a hello message.",
  },
  {
    id: "add",
    method: "POST",
    path: "/api/add",
    description: "Adds two numbers and returns the result.",
    body: { a: 2, b: 3 },
  },
  {
    id: "credit-score",
    method: "POST",
    path: "/api/credit-score",
    description:
      "Calculates a credit score and band from utilization, account tenure and disputes.",
    body: {
      current_balance: 15000,
      credit_limit: 50000,
      account_opened: "2019-01-29",
      dispute_count: 1,
    },
  },
  {
    id: "bajaj-xirr",
    method: "GET",
    path: "/bajaj/getXIRRCalResult?dates=29-01-2019,29-05-2026&amount=-20000,40000",
    description:
      "Proxies the Bajaj AMC XIRR calculator. The API key is hardcoded server-side.",
  },
];

export function buildCurl(endpoint: Endpoint, baseUrl: string): string {
  const url = `${baseUrl}${endpoint.path}`;
  if (endpoint.method === "GET") return `curl '${url}'`;
  return [
    `curl -X ${endpoint.method} '${url}'`,
    `  -H 'Content-Type: application/json'`,
    `  -d '${JSON.stringify(endpoint.body ?? {})}'`,
  ].join(" \\\n");
}
