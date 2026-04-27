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

    // 1. Ambil data user pending
    const result = await pool.query(
      "SELECT * FROM pending_users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // 2. Validasi kode verifikasi
    if (user.verification_code !== code) {
      return NextResponse.json(
        { message: "Kode verifikasi salah" },
        { status: 400 }
      );
    }

    // 3. Set role dari backend (AMAN)
    const ROLE = {
      ADMIN: 1,
      USER: 2,
    };

    const defaultRole = ROLE.USER;

    // 4. Insert ke biodata
    await pool.query(
      `
      INSERT INTO biodata (
        nama_lengkap,
        tanggal_lahir,
        alamat_lengkap_saat_ini,
        nomor_hp,
        email,
        password,
        jenis_kelamin,
        status_nikah,
        role
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        user.nama_lengkap,
        user.tanggal_lahir,
        user.alamat,
        user.no_hp,
        user.email,
        user.password,
        user.gender,
        user.status_nikah,
        defaultRole, //  selalu USER (2)
      ]
    );

    // 5. Hapus dari pending
    await pool.query(
      "DELETE FROM pending_users WHERE email = $1",
      [email]
    );

    return NextResponse.json({
      success: true,
      message: "Verifikasi berhasil",
    });

  } catch (err: any) {
    console.error(" VERIFY ERROR:", err);
    return NextResponse.json(
      { message: err.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}