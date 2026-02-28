import { NextRequest, NextResponse } from "next/server";

const SOFIAPLAN_BASE = "https://api.sofiaplan.bg";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = "/" + path.join("/");
  const url = `${SOFIAPLAN_BASE}${apiPath}`;

  try {
    const response = await fetch(url, {
      headers: { "Accept": "application/json, */*" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `SofiaPlan API error: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json") || contentType.includes("geojson")) {
      const data = await response.json();
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    // For non-JSON (binary, etc.)
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error(`SofiaPlan proxy error for ${url}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch from SofiaPlan API" },
      { status: 502 }
    );
  }
}
