import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function getRole(role: string | undefined) {
  return Number(role || 0);
}

export async function GET() {
  try {
    const cookieStore = await cookies();

    const email = cookieStore.get("email")?.value;
    const role = cookieStore.get("role")?.value;

    if (!email || getRole(role) !== 2) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
      "SELECT * FROM biodata WHERE email = $1",
      [email]
    );

    const data = result.rows[0];

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 780;

    // ================= HEADER =================
    page.drawText("BIODATA PESERTA", {
      x: 200,
      y,
      size: 20,
      font: bold,
      color: rgb(0, 0, 0),
    });

    y -= 30;

    page.drawText("------------------------------------------------------------", {
      x: 50,
      y,
      size: 10,
      font,
    });

    y -= 40;

    // ================= HELPER FIELD =================
    const drawField = (label: string, value: any) => {
      page.drawText(label, {
        x: 50,
        y,
        size: 11,
        font: bold,
      });

      page.drawText(": " + (value ?? "-"), {
        x: 200,
        y,
        size: 11,
        font,
      });

      y -= 18;
    };

    // ================= SECTION 1 =================
    page.drawText("DATA PRIBADI", {
      x: 50,
      y,
      size: 14,
      font: bold,
      color: rgb(0, 0, 0.5),
    });

    y -= 25;

    drawField("Nama Lengkap", data.nama_lengkap);
    drawField("Email", data.email);
    drawField("Jenis Kelamin", data.jenis_kelamin);
    drawField("Status Nikah", data.status_nikah);
    drawField("Agama", data.agama);
    drawField("Kewarganegaraan", data.kewarganegaraan);

    y -= 10;

    // ================= SECTION 2 =================
    page.drawText("TEMPAT & TANGGAL LAHIR", {
      x: 50,
      y,
      size: 14,
      font: bold,
      color: rgb(0, 0, 0.5),
    });

    y -= 25;

    drawField("Tanggal Lahir", data.tanggal_lahir);
    drawField("Tempat Lahir", data.tempat_lahir);
    drawField("Kota Lahir", data.kota_lahir);
    drawField("Provinsi Lahir", data.provinsi_lahir);

    y -= 10;

    // ================= SECTION 3 =================
    page.drawText("ALAMAT", {
      x: 50,
      y,
      size: 14,
      font: bold,
      color: rgb(0, 0, 0.5),
    });

    y -= 25;

    drawField("Alamat KTP", data.alamat_ktp);
    drawField("Alamat Sekarang", data.alamat_lengkap_saat_ini);
    drawField("Kecamatan", data.kecamatan);
    drawField("Kabupaten", data.kabupaten);
    drawField("Provinsi", data.provinsi);

    y -= 10;

    // ================= SECTION 4 =================
    page.drawText("KONTAK", {
      x: 50,
      y,
      size: 14,
      font: bold,
      color: rgb(0, 0, 0.5),
    });

    y -= 25;

    drawField("Nomor HP", data.nomor_hp);

    // ================= FOTO (BOTTOM, NO STRETCH) =================
    if (data.foto) {
      try {
        const imageBytes = Buffer.from(data.foto);

        const image = await pdfDoc.embedJpg(imageBytes);

        const dims = image.scale(1);

        const maxWidth = 120;
        const maxHeight = 150;

        let width = dims.width;
        let height = dims.height;

        // JAGA ASPECT RATIO (ANTI GEPENG)
        const ratio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / ratio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * ratio;
        }

        // POSISI PALING BAWAH
        page.drawImage(image, {
          x: 230,
          y: 120,
          width,
          height,
        });

        
      } catch (err) {
        console.log("Foto gagal ditampilkan");
      }
    }

    // ================= FOOTER =================
    page.drawText("------------------------------------------------------------", {
      x: 50,
      y: 80,
      size: 10,
      font,
    });

    page.drawText("Dokumen ini digenerate otomatis oleh sistem", {
      x: 50,
      y: 60,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}