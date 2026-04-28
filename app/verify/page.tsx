"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyPage() {
  //untuk mengambil email/code verify
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email");
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Verifikasi berhasil!");
    router.push("/");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-6 rounded-xl w-80">
        <h1 className="text-xl mb-4">Verifikasi Email</h1>

        <input
          type="text"
          placeholder="Masukkan kode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-2 bg-zinc-800 border rounded mb-4"
        />

        <button
          onClick={handleVerify}
          className="w-full bg-orange-500 p-2 rounded"
        >
          Verifikasi
        </button>
      </div>
    </div>
  );
}
