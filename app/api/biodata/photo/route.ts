import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";

function getRole(role: string | undefined) {
  return Number(role || 0);
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const email = cookieStore.get("email")?.value;
    const role = cookieStore.get("role")?.value;

    if (!email || getRole(role) !== 2) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("foto") as File;

    if (!file) {
      return NextResponse.json({ message: "Foto tidak ditemukan" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await pool.query(
      "UPDATE biodata SET foto = $1 WHERE email = $2",
      [buffer, email]
    );

    return NextResponse.json({ message: "Upload foto berhasil" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}