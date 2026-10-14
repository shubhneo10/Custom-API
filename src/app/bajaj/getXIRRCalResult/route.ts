import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("bajaj-xirr");

const UPSTREAM_URL = "https://mfapi.advisorkhoj.com/bajaj/getXIRRCalResult";
// Always sent upstream; any `key` passed by the caller is ignored.
const API_KEY = "15a10962-4d52-4bdf-8b30-448eb1ccae46";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dates = searchParams.get("dates");
  const amount = searchParams.get("amount");
  logger.info("request received", { dates, amount });

  if (!dates || !amount) {
    logger.warn("validation failed: missing params", { dates, amount });
    return NextResponse.json(
      { error: "dates and amount query params are required" },
      { status: 400 }
    );
  }

  const upstream = new URL(UPSTREAM_URL);
  upstream.searchParams.set("key", API_KEY);
  upstream.searchParams.set("dates", dates);
  upstream.searchParams.set("amount", amount);

  try {
    const res = await fetch(upstream, {
      headers: {
        Accept: "*/*",
        Origin: "https://www.bajajamc.com",
        Referer: "https://www.bajajamc.com/",
      },
      cache: "no-store",
    });
    const body = await res.text();
    logger.info("upstream responded", { status: res.status, body });

    return new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (err) {
    logger.error("upstream request failed", { error: String(err) });
    return NextResponse.json({ error: "upstream request failed" }, { status: 502 });
  }
}
