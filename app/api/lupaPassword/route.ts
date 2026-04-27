import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email wajib diisi" },
        { status: 400 }
      );
    }

    //  1. CEK USER DI BIODATA
    const userQuery = await pool.query(
      `SELECT * FROM biodata WHERE email = $1`,
      [email]
    );

    //  SECURITY: jangan kasih tau email ada/tidak
    if (userQuery.rows.length === 0) {
      return NextResponse.json(
        { message: "Jika email terdaftar, kode akan dikirim" },
        { status: 200 }
      );
    }

    const user = userQuery.rows[0];

    //  2. HAPUS OTP LAMA (kalau ada)
    await pool.query(
      "DELETE FROM pending_users WHERE email = $1",
      [email]
    );

    //  3. GENERATE OTP
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    //  4. SIMPAN KE pending_users (hanya field yang ada)
    await pool.query(
      `INSERT INTO pending_users 
      (nama_lengkap, tanggal_lahir, alamat, no_hp, email, password, gender, status_nikah, verification_code)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        user.nama_lengkap,
        user.tanggal_lahir || null,
        user.alamat_lengkap_saat_ini || null,
        user.nomor_hp || null,
        user.email,
        user.password,
        user.jenis_kelamin || null,
        user.status_nikah || null,
        verificationCode,
      ]
    );

    //  5. KIRIM EMAIL
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset Password",
        html: `
          <div>
            <h2>Halo ${user.nama_lengkap}</h2>
            <p>Kode reset password kamu:</p>
            <h1>${verificationCode}</h1>
            <p>Berlaku 10 menit</p>
          </div>
        `,
      });
    } catch (emailError: any) {
      console.error(" EMAIL ERROR:", emailError.message);
      // tetap lanjut (biar gak bocorin info user)
    }

    return NextResponse.json({
      success: true,
      message: "Kode reset password telah dikirim",
    });

  } catch (err: any) {
    console.error(" SERVER ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}