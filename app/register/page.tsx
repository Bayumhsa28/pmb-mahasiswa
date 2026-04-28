"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

type FormType = {
  nama: string;
  tanggal: string;
  alamat: string;
  hp: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  statusNikah: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormType>({
    nama: "",
    tanggal: "",
    alamat: "",
    hp: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    statusNikah: "",
  });
  const handleChange = (field: keyof FormType, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    if (!form.nama || !form.email || !form.password) {
      alert("Nama, email, dan password wajib diisi!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Password tidak sama!");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Register berhasil!");
        router.push(`/verify?email=${form.email}`);
      } else {
        alert(data.message || "Gagal register");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-white text-black">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-lg relative border border-zinc-700 text-white">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-orange-500/20 hover:scale-110 transition"
        >
          {/* <Image src={closeIcon} alt="close" width={20} height={20} /> */}
        </button>

        <h1 className="text-2xl font-bold text-center mb-6">Form Register</h1>

        <form className="space-y-4">
          {/* Nama */}
          <div>
            <label className="text-sm font-medium">
              Nama (Sesuai akta kelahiran)
            </label>
            <input
              type="text"
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Masukkan nama lengkap"
              onChange={(e) => handleChange("nama", e.target.value)}
            />
          </div>

          {/* Tempat & Tanggal Lahir */}
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="text-sm font-medium">Tanggal Lahir</label>
              <input
                type="date"
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
                onChange={(e) => handleChange("tanggal", e.target.value)}
              />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="text-sm font-medium">Alamat Rumah</label>
            <textarea
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
              rows={3}
              placeholder="Masukkan alamat lengkap"
              onChange={(e) => handleChange("alamat", e.target.value)}
            />
          </div>

          {/* No HP */}
          <div>
            <label className="text-sm font-medium">No. HP / WhatsApp</label>
            <input
              type="text"
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
              placeholder="08xxxxxxxxxx"
              onChange={(e) => handleChange("hp", e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
              placeholder="email@gmail.com"
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="text-sm font-medium">Ketik Ulang Password</label>
            <input
              type="password"
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm font-medium">Gender</label>
            <select
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <option value="">Pilih Gender</option>
              <option value="lk">Laki-Laki</option>
              <option value="pr">Perempuan</option>
            </select>
          </div>

          {/* Status Nikah */}
          <div>
            <label className="text-sm font-medium">Status Nikah</label>
            <select
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
              onChange={(e) => handleChange("statusNikah", e.target.value)}
            >
              <option value="">Pilih Status Nikah</option>
              <option value="Belum Nikah">Belum Nikah</option>
              <option value="Sudah Nikah">Sudah Nikah</option>
              <option value="Sudah Nikah">Lain-lain (Duda/Janda)</option>
            </select>
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={handleRegister}
            className="w-full bg-gradient-to-r bg-white text-black font-semibold py-2 rounded-lg hover:scale-105 transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
