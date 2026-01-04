import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_NANNIES_API_URL ||
  "https://realistic-hope-d6c1c5274b.strapiapp.com";
const STRAPI_TOKEN = process.env.NANNIES_API_TOKEN;

export async function GET(request: NextRequest) {
  const url = new URL("/api/coupon-redemptions", STRAPI_URL);

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
      console.error(
        "Strapi coupon-redemptions API error:",
        response.status,
        errorText
      );
      return NextResponse.json(
        { error: "Failed to fetch coupon redemptions", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error for coupon-redemptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
