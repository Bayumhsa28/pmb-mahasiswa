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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedEdit, setSelectedEdit] = useState<any>(null);
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

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!selectedEdit) return;

    await fetch("/api/jumlahUserAdmin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedEdit),
    });

    setIsEditOpen(false);
    fetchData();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-500 text-white font-black">
        LOADING...
      </div>
    );

  const input =
    "w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none";

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <HeaderAdmin
        user={user}
        handleLogout={handleLogout}
        isMenuOpen={isMenuOpen}
      />

      {/* ================= TABLE ================= */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <table className="w-full">
            <thead className="bg-orange-100">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Nama</th>
                <th className="p-3">HP</th>
                <th className="p-3">Kelamin</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {dataUsers.map((u) => (
                <tr key={u.email} className="border-b hover:bg-orange-50">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.nama_lengkap}</td>
                  <td className="p-3">{u.nomor_hp}</td>
                  <td className="p-3">{u.jenis_kelamin}</td>

                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setIsDetailOpen(true);
                      }}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      Detail
                    </button>

                    <button
                      onClick={() => {
                        setSelectedEdit(u);
                        setIsEditOpen(true);
                      }}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDelete(u.email);
                        setShowDelete(true);
                      }}
                      className="px-2 py-1 bg-red-500 text-white rounded"
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

      {/* ================= DETAIL POPUP ================= */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-xl w-[500px] max-h-[80vh] overflow-auto">
            <h2 className="font-bold mb-4">DETAIL BIODATA</h2>

            {Object.entries(selectedUser).map(([key, value]) => {
              if (key === "password") return null;

              if (key === "tanggal_lahir" && value) {
                value = String(value).split("T")[0];
              }

              return (
                <p key={key}>
                  <b>{key}:</b> {String(value ?? "-")}
                </p>
              );
            })}

            <button
              onClick={() => setIsDetailOpen(false)}
              className="mt-4 w-full bg-black text-white py-2 rounded"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ================= EDIT POPUP ================= */}
      {isEditOpen && selectedEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-xl w-[600px] max-h-[90vh] overflow-auto">
            <h2 className="font-bold mb-4">EDIT BIODATA</h2>

            {Object.keys(selectedEdit).map((key) => {
              if (key === "password") return null;

              return (
                <div key={key} className="mb-2">
                  <label className="text-sm font-bold">{key}</label>

                  <input
                    type={key === "tanggal_lahir" ? "date" : "text"}
                    className={input}
                    value={
                      key === "tanggal_lahir" && selectedEdit[key]
                        ? String(selectedEdit[key]).split("T")[0]
                        : selectedEdit[key] || ""
                    }
                    onChange={(e) =>
                      setSelectedEdit({
                        ...selectedEdit,
                        [key]: e.target.value,
                      })
                    }
                  />
                </div>
              );
            })}

            <button
              onClick={handleUpdate}
              className="w-full bg-green-600 text-white py-2 rounded mt-4"
            >
              SIMPAN
            </button>

            <button
              onClick={() => setIsEditOpen(false)}
              className="w-full bg-gray-300 py-2 rounded mt-2"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* ================= DELETE ================= */}
      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-xl">
            <p>Hapus user?</p>

            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 mt-3 rounded"
            >
              Hapus
            </button>

            <button
              onClick={() => setShowDelete(false)}
              className="ml-2 px-4 py-2 bg-gray-300 rounded"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
