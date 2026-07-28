import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT *
      FROM public.sekolah_ntt_full
      ORDER BY school_name NULLS LAST, id;
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch sekolah NTT:", error);
    return NextResponse.json(
      { error: "Gagal memuat data sekolah NTT" },
      { status: 500 },
    );
  }
}
