import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_GEAR_REFRESH_API_URL ||
  "https://thankful-dance-5823fe0795.strapiapp.com";
const STRAPI_TOKEN = process.env.GEAR_REFRESH_API_TOKEN;

export async function GET(request: NextRequest) {
  const url = new URL("/api/orders", STRAPI_URL);

  // Forward all query parameters from the incoming request
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Strapi gear-refresh API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch gear refresh orders", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error for gear-refresh:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
