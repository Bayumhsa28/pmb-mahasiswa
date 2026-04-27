"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
// import Button from "../src/components/button";
// import logo from "../src/ikon/kunci.png";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal login");
        return; // Stop eksekusi jika gagal
      }

      // Ambil role langsung dari response API login
      // Pastikan backend kamu mengirimkan data user dalam response login-nya
      const role = data.user?.role;

      if (role === 2) {
        // Sesuai query SQL sebelumnya, role 2 biasanya Admin
        router.push("/biodataPage");
      } else if (role === 1) {
        // Role 1 biasanya User biasa
        router.push("/jumlahUserAdmin");
      } else {
        alert("Role tidak valid atau tidak ditemukan");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br bg-white text-black">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden border border-zinc-700">
        {/* LEFT SIDE */}
        <div className="w-1/2 bg-black text-white flex flex-col items-center justify-center p-8">
          {/* <Image
            src={logo}
            alt="Logo"
            width={100}
            height={100}
            className="mb-4 drop-shadow-lg"
          /> */}

          <h1 className="text-3xl font-bold text-center">Universitas</h1>

          <p className="text-sm mt-2 text-center opacity-80">
            Join untuk menjadi mahasiswa baru
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/2 p-8 text-white">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <div className="flex justify-between text-sm text-zinc-400">
              <span
                className="cursor-pointer hover:text-orange-400"
                onClick={() => router.push("/lupaPassword")}
              >
                Lupa password?
              </span>
              <span
                onClick={() => router.push("/register")}
                className="cursor-pointer hover:text-orange-400"
              >
                Register
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r bg-white text-black font-semibold py-2 rounded-lg hover:scale-105 transition"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
