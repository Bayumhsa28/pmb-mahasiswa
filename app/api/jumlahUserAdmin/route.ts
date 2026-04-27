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
    const body = await req.json();

    const fields = [
      "nama_lengkap",
      "tanggal_lahir",
      "tempat_lahir",
      "kota_lahir",
      "provinsi_lahir",
      "jenis_kelamin",
      "status_nikah",
      "agama",
      "kewarganegaraan",
      "alamat_ktp",
      "alamat_lengkap_saat_ini",
      "kecamatan",
      "kabupaten",
      "provinsi",
      "kabupaten_ijazah",
      "provinsi_ijazah",
      "nomor_telepon",
      "nomor_hp",
      "email",
    ];

    const values = fields.map((f) => body[f]);

    await pool.query(
      `UPDATE biodata SET
        nama_lengkap=$1,
        tanggal_lahir=$2,
        tempat_lahir=$3,
        kota_lahir=$4,
        provinsi_lahir=$5,
        jenis_kelamin=$6,
        status_nikah=$7,
        agama=$8,
        kewarganegaraan=$9,
        alamat_ktp=$10,
        alamat_lengkap_saat_ini=$11,
        kecamatan=$12,
        kabupaten=$13,
        provinsi=$14,
        kabupaten_ijazah=$15,
        provinsi_ijazah=$16,
        nomor_telepon=$17,
        nomor_hp=$18
      WHERE email=$19`,
      values
    );

    return NextResponse.json({ message: "Updated" });
  } catch (e) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}