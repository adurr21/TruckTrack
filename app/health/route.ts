import { NextResponse } from "next/server";

// Keep this endpoint independent of authentication and external services.
// Docker uses it to determine whether this Node process can accept requests.
export function GET() {
  return new NextResponse("ok\n", {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
