import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

const SECRET = process.env.JWT_SECRET || "secret";

// ================= GET ALL BIODATA =================
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, SECRET);

    if (decoded.role !== 1)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const result = await pool.query(`
      SELECT 
        email,
        nama_lengkap,
        password,
        tanggal_lahir,
        tempat_lahir,
        kota_lahir,
        provinsi_lahir,
        jenis_kelamin,
        status_nikah,
        agama,
        kewarganegaraan,
        alamat_ktp,
        alamat_lengkap_saat_ini,
        kecamatan,
        kabupaten,
        provinsi,
        kabupaten_ijazah,
        provinsi_ijazah,
        nomor_telepon,
        nomor_hp,
        created_at
      FROM biodata
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      adminInfo: {
        nama: decoded.nama_lengkap,
        email: decoded.email,
      },
      allUsers: result.rows,
    });
  } catch (err) {
    return NextResponse.json({ message: "Sesi tidak valid" }, { status: 401 });
  }
}

// ================= DELETE =================
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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Error delete" }, { status: 500 });
  }
}

// ================= UPDATE BIODATA (FULL EDIT) =================
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, SECRET);

    if (decoded.role !== 1)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();

    await pool.query(
      `UPDATE biodata SET
        nama_lengkap = $1,
        password = $2,
        tanggal_lahir = $3,
        tempat_lahir = $4,
        kota_lahir = $5,
        provinsi_lahir = $6,
        jenis_kelamin = $7,
        status_nikah = $8,
        agama = $9,
        kewarganegaraan = $10,
        alamat_ktp = $11,
        alamat_lengkap_saat_ini = $12,
        kecamatan = $13,
        kabupaten = $14,
        provinsi = $15,
        kabupaten_ijazah = $16,
        provinsi_ijazah = $17,
        nomor_telepon = $18,
        nomor_hp = $19
      WHERE email = $20`,
      [
        body.nama_lengkap,
        body.password,
        body.tanggal_lahir,
        body.tempat_lahir,
        body.kota_lahir,
        body.provinsi_lahir,
        body.jenis_kelamin,
        body.status_nikah,
        body.agama,
        body.kewarganegaraan,
        body.alamat_ktp,
        body.alamat_lengkap_saat_ini,
        body.kecamatan,
        body.kabupaten,
        body.provinsi,
        body.kabupaten_ijazah,
        body.provinsi_ijazah,
        body.nomor_telepon,
        body.nomor_hp,
        body.email,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Error update" }, { status: 500 });
  }
}