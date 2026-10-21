import { NextResponse } from "next/server";
import { client, projectId, dataset } from "@/lib/sanity";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const total = await client.fetch<number>(
      `count(*[_type in ["product", "producto"]])`
    );
    const types = await client.fetch<string[]>(`array::unique(*[]._type)`);
    const sample = await client.fetch(
      `*[_type in ["product", "producto"]][0...2]{..., "imageUrl": image.asset->url}`
    );

    return NextResponse.json({ projectId, dataset, total, types, sample });
  } catch (error) {
    return NextResponse.json(
      { projectId, dataset, error: String(error) },
      { status: 500 }
    );
  }
}