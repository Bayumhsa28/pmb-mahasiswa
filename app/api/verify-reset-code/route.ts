import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email dan kode wajib diisi" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM pending_users 
       WHERE email = $1 AND verification_code = $2`,
      [email, code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Kode salah atau kadaluarsa" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kode valid",
    });

  } catch (err: any) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}