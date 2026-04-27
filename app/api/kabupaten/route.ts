import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const provinsi_id = searchParams.get("provinsi_id");

    if (!provinsi_id) {
      return NextResponse.json(
        { message: "provinsi_id wajib" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT id, nama 
       FROM kabupaten 
       WHERE provinsi_id = $1
       ORDER BY nama`,
      [provinsi_id]
    );

    return NextResponse.json(result.rows || []);
  } catch (err: any) {
    return NextResponse.json(
      {
        message: "Server error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}