import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { a, b } = await request.json();

  if (typeof a !== "number" || typeof b !== "number") {
    return NextResponse.json(
      { error: "Both 'a' and 'b' must be numbers" },
      { status: 400 }
    );
  }

  return NextResponse.json({ result: a + b });
}
