"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
// import closeIcon from "../../src/ikon/close.svg";

type FormType = {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormType>({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"code" | "password">("code");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Ambil email dari URL params
  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      setForm((prev) => ({ ...prev, email }));
    }
  }, [searchParams]);

  const handleChange = (field: keyof FormType, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (status !== "idle") setStatus("idle");
  };

  const verifyCode = async () => {
    if (!form.verificationCode || form.verificationCode.length !== 6) {
      setStatus("error");
      setMessage("Masukkan kode 6 digit yang lengkap!");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          code: form.verificationCode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("password");
        setStatus("success");
        setMessage("Kode verifikasi benar! Buat password baru.");
      } else {
        setStatus("error");
        setMessage(
          data.message || "Kode verifikasi salah atau sudah kadaluarsa",
        );
      }
    } catch (err) {
      setStatus("error");
      setMessage("Terjadi error, coba minta kode baru");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!form.newPassword || form.newPassword.length < 6) {
      setStatus("error");
      setMessage("Password minimal 6 karakter!");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setStatus("error");
      setMessage("Konfirmasi password tidak cocok!");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          code: form.verificationCode,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Password berhasil direset! Silakan login.");
        setTimeout(() => router.push("/"), 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "Gagal mereset password");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Terjadi error, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lupaPassword", {
        // ✅ FIXED: Sesuai backend Anda
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Kode baru dikirim ulang!");
        setForm((prev) => ({ ...prev, verificationCode: "" })); // Reset code input
      }
    } catch (err) {
      setStatus("error");
      setMessage("Gagal kirim ulang kode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-white text-black p-4">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-zinc-700 text-white animate-in fade-in zoom-in duration-500">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-orange-500/20 hover:scale-110 transition-all duration-200"
          disabled={loading}
        >
          {/* <Image src={closeIcon} alt="close" width={20} height={20} /> */}
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            {step === "code" ? (
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {step === "code" ? "Verifikasi Kode" : "Password Baru"}
          </h1>
          <p className="text-zinc-400 text-sm">
            {step === "code"
              ? "Masukkan kode 6 digit yang dikirim ke email Anda"
              : "Buat password baru yang kuat"}
          </p>
        </div>

        {/* Email Display */}
        <div className="mb-6 p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-center">
          <p className="text-sm text-zinc-400">Menggunakan email:</p>
          <p className="font-medium text-white truncate">
            {form.email || "Tidak ada email"}
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {step === "code" ? (
            <>
              {/* Verification Code Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kode Verifikasi (6 digit)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={form.verificationCode}
                    onChange={(e) =>
                      handleChange(
                        "verificationCode",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    className="w-full p-4 bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-white uppercase"
                    placeholder="000000"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Resend Button */}
              <button
                type="button"
                onClick={resendCode}
                disabled={loading}
                className="w-full text-orange-400 hover:text-orange-300 text-sm font-medium py-2 px-4 rounded-xl hover:bg-zinc-800/50 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Mengirim..." : "Kirim Ulang Kode"}
              </button>
            </>
          ) : (
            <>
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-zinc-500"
                  placeholder="Minimal 6 karakter"
                  disabled={loading}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-zinc-500"
                  placeholder="Ketik ulang password"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Status Messages */}
          {status === "success" && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-100 text-sm animate-pulse">
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {message}
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 text-sm">
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {message}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={step === "code" ? verifyCode : resetPassword}
            disabled={loading}
            className="w-full bg-gradient-to-r bg-white text-black font-semibold py-3 px-4 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memproses...
              </>
            ) : step === "code" ? (
              "Verifikasi Kode"
            ) : (
              "Simpan Password Baru"
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full text-zinc-400 hover:text-white font-medium py-2 px-4 rounded-xl hover:bg-zinc-800/50 transition-all duration-200 text-sm border border-zinc-700"
            disabled={loading}
          >
            Kembali ke Login
          </button>
        </form>
      </div>
    </div>
  );
}
