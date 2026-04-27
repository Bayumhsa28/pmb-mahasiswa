import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secret";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    //  ambil dari biodata
    const result = await pool.query(
      `SELECT email, password, nama_lengkap, role
       FROM biodata
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // cek password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Password salah" },
        { status: 401 }
      );
    }

    // token
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        nama_lengkap: user.nama_lengkap,
      },
      SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        email: user.email,
        role: user.role,
        nama_lengkap: user.nama_lengkap,
      },
    });

    // cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    //  penting buat biodata page
    response.cookies.set("email", user.email);
    response.cookies.set("role", String(user.role));

    return response;

  } catch (err: any) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}