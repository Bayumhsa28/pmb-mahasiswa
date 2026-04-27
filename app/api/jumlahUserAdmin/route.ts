import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

const SECRET = process.env.JWT_SECRET || "secret";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, SECRET);

    if (decoded.role !== 1)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // 🔥 SESUAI TABLE BARU KAMU
    const result = await pool.query(
      `SELECT 
        email,
        nama_lengkap,
        tanggal_lahir,
        jenis_kelamin,
        kewarganegaraan,
        nomor_hp,
        created_at
      FROM biodata
      ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      adminInfo: {
        nama: decoded.nama_lengkap,
        email: decoded.email,
      },
      allUsers: result.rows,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Sesi tidak valid" },
      { status: 401 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const { email } = await req.json();

    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, SECRET);

    if (decoded.role !== 1)
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    await pool.query("DELETE FROM biodata WHERE email = $1", [email]);

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}