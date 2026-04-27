import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";

function getRole(role: string | undefined) {
  return Number(role || 0);
}

// ===================== GET =====================
export async function GET() {
  try {
    const cookieStore = await cookies(); //  FIX HERE

    const email = cookieStore.get("email")?.value;
    const role = cookieStore.get("role")?.value;

    // 🔥 ONLY ROLE 2 CAN ACCESS
    if (!email || getRole(role) !== 2) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await pool.query(
      "SELECT * FROM biodata WHERE email = $1",
      [email]
    );

    return NextResponse.json(result.rows[0] || {});
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}

// ===================== PUT =====================
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies(); //  FIX HERE

    const email = cookieStore.get("email")?.value;
    const role = cookieStore.get("role")?.value;

    //  ONLY ROLE 2 CAN ACCESS
    if (!email || getRole(role) !== 2) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const current = await pool.query(
      "SELECT * FROM biodata WHERE email = $1",
      [email]
    );

    const old = current.rows[0];

    let provinsiNama = old.provinsi;

if (body.provinsi) {
  const result = await pool.query(
    `SELECT nama FROM provinsi WHERE id = $1`,
    [body.provinsi]
  );

  provinsiNama = result.rows[0]?.nama ?? old.provinsi;
}

    await pool.query(
      `UPDATE biodata SET
        nama_lengkap = $1,
        alamat_ktp = $2,
        alamat_lengkap_saat_ini = $3,
        kecamatan = $4,
        provinsi = $5,
        kabupaten = $6,
        nomor_hp = $7,
        kewarganegaraan = $8,
        tanggal_lahir = $9,
        tempat_lahir = $10,
        kota_lahir = $11,
        provinsi_lahir = $12,
        provinsi_ijazah = $13,
        kabupaten_ijazah = $14,
        jenis_kelamin = $15,
        status_nikah = $16,
        agama = $17
      WHERE email = $18`,
      [
        body.nama_lengkap ?? old.nama_lengkap,
        body.alamat_ktp ?? old.alamat_ktp,
        body.alamat_lengkap_saat_ini ?? old.alamat_lengkap_saat_ini,
        body.kecamatan ?? old.kecamatan,
        provinsiNama,
        body.kabupaten ?? old.kabupaten,
        body.nomor_hp ?? old.nomor_hp,
        body.kewarganegaraan ?? old.kewarganegaraan,
        body.tanggal_lahir ?? old.tanggal_lahir,
        body.tempat_lahir ?? old.tempat_lahir,
        body.kota_lahir ?? old.kota_lahir,
        body.provinsi_lahir ?? old.provinsi_lahir,
        body.provinsi_ijazah ?? old.provinsi_ijazah,
        body.kabupaten_ijazah ?? old.kabupaten_ijazah,
        body.jenis_kelamin ?? old.jenis_kelamin,
        body.status_nikah ?? old.status_nikah,
        body.agama ?? old.agama,
        email,
      ]
    );

    return NextResponse.json({ message: "Update berhasil" });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}