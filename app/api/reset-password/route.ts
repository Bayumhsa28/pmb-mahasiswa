import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      throw new Error("Semua field wajib diisi");
    }

    if (newPassword.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }

    //  1. CEK OTP
    const pendingQuery = await client.query(
      `SELECT * FROM pending_users 
       WHERE email = $1 AND verification_code = $2 
       FOR UPDATE`,
      [email, code]
    );

    if (pendingQuery.rows.length === 0) {
      throw new Error("Kode verifikasi salah atau sudah kadaluarsa");
    }

    //  2. HASH PASSWORD BARU
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //  3. UPDATE PASSWORD DI BIODATA (TANPA ID)
    const updateResult = await client.query(
      `UPDATE biodata 
       SET password = $1 
       WHERE email = $2`,
      [hashedPassword, email]
    );

    //  cek apakah user ada
    if (updateResult.rowCount === 0) {
      throw new Error("User tidak ditemukan di biodata");
    }

    //  4. HAPUS OTP
    await client.query(
      `DELETE FROM pending_users WHERE email = $1`,
      [email]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Password berhasil direset!",
    });

  } catch (err: any) {
    await client.query("ROLLBACK");

    console.error(" RESET ERROR:", err.message);

    return NextResponse.json(
      { message: err.message || "Gagal reset password" },
      { status: 400 }
    );
  } finally {
    client.release();
  }
}