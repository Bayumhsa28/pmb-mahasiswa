"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/src/components/header";

export default function Biodata() {
  const router = useRouter();

  const [data, setData] = useState<any>({});
  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [kabupatenList, setKabupatenList] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  // 🔐 AUTH + LOAD DATA
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/biodata");

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const result = await res.json();

        if (!mounted) return;

        // 🔥 hanya isi sekali dari DB
        if (!initialized) {
          const safeData = {
            nama_lengkap: result?.nama_lengkap ?? "",
            email: result?.email ?? "",
            alamat_ktp: result?.alamat_ktp ?? "",
            alamat_lengkap_saat_ini: result?.alamat_lengkap_saat_ini ?? "",
            kecamatan: result?.kecamatan ?? "",
            provinsi: result?.provinsi ?? "",
            kabupaten: result?.kabupaten ?? "",
            nomor_hp: result?.nomor_hp ?? "",
            kewarganegaraan: result?.kewarganegaraan ?? "",
            tanggal_lahir: result?.tanggal_lahir ?? "",
            tempat_lahir: result?.tempat_lahir ?? "",
            kota_lahir: result?.kota_lahir ?? "",
            provinsi_lahir: result?.provinsi_lahir ?? "",
            provinsi_ijazah: result?.provinsi_ijazah ?? "",
            kabupaten_ijazah: result?.kabupaten_ijazah ?? "",
            jenis_kelamin: result?.jenis_kelamin ?? "",
            status_nikah: result?.status_nikah ?? "",
            agama: result?.agama ?? "",
          };

          setData(safeData);
          setInitialized(true);

          // 🔥 AUTO LOAD KABUPATEN
          if (safeData.provinsi) {
            fetch(`/api/kabupaten?provinsi_id=${safeData.provinsi}`)
              .then((res) => res.json())
              .then((res) => {
                setKabupatenList(Array.isArray(res) ? res : []);
              })
              .catch(() => setKabupatenList([]));
          }
        }
      } catch (err) {
        router.push("/login");
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [initialized, router]);

  // GET PROVINSI
  useEffect(() => {
    fetch("/api/provinsi")
      .then((res) => res.json())
      .then((res) => setProvinsiList(Array.isArray(res) ? res : []))
      .catch(() => setProvinsiList([]));
  }, []);

  // GET KABUPATEN WHEN PROVINSI CHANGE
  useEffect(() => {
    if (!data?.provinsi) {
      setKabupatenList([]);
      return;
    }

    const controller = new AbortController();

    fetch(`/api/kabupaten?provinsi_id=${data.provinsi}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((res) => {
        setKabupatenList(Array.isArray(res) ? res : []);
      })
      .catch(() => setKabupatenList([]));

    return () => controller.abort();
  }, [data.provinsi]);

  // HANDLE CHANGE
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setData((prev: any) => ({
      ...prev,
      [name]: value,
      ...(name === "provinsi" ? { kabupaten: "" } : {}),
    }));
  };

  // SUBMIT UPDATE
  const handleSubmit = async () => {
    try {
      await fetch("/api/biodata", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      alert("Data berhasil diupdate");
    } catch (err) {
      alert("Gagal update data");
    }
  };

  const inputStyle =
    "w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

  const labelStyle = "block text-sm font-semibold text-gray-700";

  return (
    <>
      <Header />

      <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg border border-gray-100 rounded-2xl space-y-6 mt-6">
        <h1 className="text-2xl font-bold text-gray-800 border-b pb-4">
          Form Biodata
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelStyle}>Nama Lengkap</label>
            <input
              name="nama_lengkap"
              value={data.nama_lengkap ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Email</label>
            <input value={data.email ?? ""} disabled className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>Alamat KTP</label>
            <input
              name="alamat_ktp"
              value={data.alamat_ktp ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Alamat Saat Ini</label>
            <input
              name="alamat_lengkap_saat_ini"
              value={data.alamat_lengkap_saat_ini ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Kecamatan</label>
            <input
              name="kecamatan"
              value={data.kecamatan ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Provinsi</label>
            <select
              name="provinsi"
              value={data.provinsi ?? ""}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Pilih Provinsi</option>
              {provinsiList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelStyle}>Kabupaten</label>
            <select
              name="kabupaten"
              value={data.kabupaten ?? ""}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Pilih Kabupaten</option>
              {kabupatenList.map((k) => (
                <option key={k.id} value={k.nama}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelStyle}>Nomor HP</label>
            <input
              name="nomor_hp"
              value={data.nomor_hp ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Kewarganegaraan</label>
            <input
              name="kewarganegaraan"
              value={data.kewarganegaraan ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Tanggal Lahir</label>
            <input
              type="date"
              name="tanggal_lahir"
              value={data.tanggal_lahir ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Tempat Lahir</label>
            <input
              name="tempat_lahir"
              value={data.tempat_lahir ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Kota Lahir</label>
            <input
              name="kota_lahir"
              value={data.kota_lahir ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Provinsi Lahir</label>
            <input
              name="provinsi_lahir"
              value={data.provinsi_lahir ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Provinsi Ijazah</label>
            <input
              name="provinsi_ijazah"
              value={data.provinsi_ijazah ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Kabupaten Ijazah</label>
            <input
              name="kabupaten_ijazah"
              value={data.kabupaten_ijazah ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Jenis Kelamin</label>
            <select
              name="jenis_kelamin"
              value={data.jenis_kelamin ?? ""}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className={labelStyle}>Status Nikah</label>
            <select
              name="status_nikah"
              value={data.status_nikah ?? ""}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Pilih</option>
              <option value="Belum Menikah">Belum Menikah</option>
              <option value="Menikah">Menikah</option>
            </select>
          </div>

          <div>
            <label className={labelStyle}>Agama</label>
            <input
              name="agama"
              value={data.agama ?? ""}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
          >
            Simpan Data
          </button>
        </div>
      </div>
    </>
  );
}
