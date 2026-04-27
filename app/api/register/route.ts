import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    //  Ambil API KEY
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error(" RESEND_API_KEY belum diset di .env.local");
      return NextResponse.json(
        { message: "Server belum dikonfigurasi dengan benar" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const body = await req.json();
    const {
      nama,
      tanggal,
      alamat,
      hp,
      email,
      password,
      gender,
      statusNikah,
    } = body;

    //  Validasi
    if (!nama || !email || !password) {
      return NextResponse.json(
        { message: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Generate kode verifikasi
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    //  Simpan ke DB
    const query = `
      INSERT INTO pending_users 
      (nama_lengkap, tanggal_lahir, alamat, no_hp, email, password, gender, status_nikah, verification_code)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;

    const values = [
      nama,
      tanggal || null,
      alamat,
      hp,
      email,
      hashedPassword,
      gender,
      statusNikah,
      verificationCode,
    ];

    await pool.query(query, values);

    //  Kirim email
    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Kode Verifikasi",
      html: `
        <div>
          <p>Halo <b>${nama}</b></p>
          <p>Kode verifikasi kamu:</p>
          <h1>${verificationCode}</h1>
        </div>
      `,
    });

    if (error) {
      console.error(" Resend error:", error);
      return NextResponse.json(
        { message: "Gagal kirim email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil, cek email",
    });

  } catch (err: any) {
    console.error(" SERVER ERROR:", err);
    return NextResponse.json(
      { message: err.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}