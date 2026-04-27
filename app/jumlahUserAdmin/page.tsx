"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderAdmin from "@/src/components/headerAdmin";

export default function JumlahUserAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [dataUsers, setDataUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedDelete, setSelectedDelete] = useState<any>(null);

  const router = useRouter();

  // ================= LOGOUT =================
  const handleLogout = async () => {
    const res = await fetch("/api/logout", { method: "POST" });
    if (res.ok) {
      alert("Logout berhasil!");
      router.push("/");
    }
  };

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res = await fetch("/api/jumlahUserAdmin");
      const json = await res.json();

      if (!res.ok) return router.push("/");

      setUser(json.adminInfo);
      setDataUsers(json.allUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= LOCK SCROLL =================
  useEffect(() => {
    if (isDetailOpen || showDelete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isDetailOpen, showDelete]);

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!selectedDelete) return;

    await fetch("/api/jumlahUserAdmin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: selectedDelete }),
    });

    setShowDelete(false);
    fetchData();
  };

  // ================= LOADING =================
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-500 text-white font-black">
        LOADING...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <HeaderAdmin
        user={user}
        handleLogout={handleLogout}
        isMenuOpen={isMenuOpen}
      />

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-orange-100 border-b">
              <tr>
                <th className="p-4 text-xs font-bold uppercase">Email</th>
                <th className="p-4 text-xs font-bold uppercase">Nama</th>
                <th className="p-4 text-xs font-bold uppercase">HP</th>
                <th className="p-4 text-xs font-bold uppercase">
                  Jenis Kelamin
                </th>
                <th className="p-4 text-xs font-bold uppercase text-center">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {dataUsers.map((u) => (
                <tr
                  key={u.email}
                  onClick={() => {
                    setSelectedUser(u);
                    setIsDetailOpen(true);
                  }}
                  className="cursor-pointer hover:bg-orange-50"
                >
                  <td className="p-4 font-mono text-xs text-orange-600">
                    {u.email}
                  </td>

                  <td className="p-4 font-semibold">{u.nama_lengkap}</td>

                  <td className="p-4 text-gray-600">{u.nomor_hp}</td>

                  <td className="p-4 text-gray-600">
                    {u.jenis_kelamin || "-"}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDelete(u.email);
                        setShowDelete(true);
                      }}
                      className="px-3 py-1 text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded hover:bg-red-500 hover:text-white"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ================= DETAIL MODAL ================= */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsDetailOpen(false)}
          />

          <div className="relative bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="font-bold mb-4">Detail Biodata</h2>

            <p>
              <b>Email:</b> {selectedUser.email}
            </p>
            <p>
              <b>Nama:</b> {selectedUser.nama_lengkap}
            </p>
            <p>
              <b>Tanggal Lahir:</b> {selectedUser.tanggal_lahir}
            </p>
            <p>
              <b>Tempat Lahir:</b> {selectedUser.tempat_lahir}
            </p>
            <p>
              <b>Kota:</b> {selectedUser.kota_lahir}
            </p>
            <p>
              <b>Provinsi:</b> {selectedUser.provinsi_lahir}
            </p>
            <p>
              <b>Jenis Kelamin:</b> {selectedUser.jenis_kelamin}
            </p>
            <p>
              <b>Status Nikah:</b> {selectedUser.status_nikah}
            </p>
            <p>
              <b>Agama:</b> {selectedUser.agama}
            </p>
            <p>
              <b>HP:</b> {selectedUser.nomor_hp}
            </p>
            <p>
              <b>Alamat:</b> {selectedUser.alamat_lengkap_saat_ini}
            </p>

            <button
              onClick={() => setIsDetailOpen(false)}
              className="mt-4 w-full bg-black text-white py-2 rounded"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowDelete(false)}
          />

          <div className="relative bg-white p-6 rounded-xl w-full max-w-md text-center">
            <p className="mb-4">Hapus user ini?</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
