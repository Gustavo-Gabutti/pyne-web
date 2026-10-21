import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const found = await searchProducts(q);

  const products = found.slice(0, 5).map((p) => ({
    id: p.id,
    brand: p.brand,
    name: p.name,
  }));

  return NextResponse.json({ products });
}