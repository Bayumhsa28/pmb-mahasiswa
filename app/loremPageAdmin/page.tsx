"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/src/components/header";

export default function LoremPages() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie;

      //  ambil token & role
      const hasToken = cookies.includes("token=");
      const roleMatch = cookies.match(/role=(\d+)/);
      const role = roleMatch ? Number(roleMatch[1]) : null;

      //  bukan admin (role 1)
      if (role !== 1) {
        router.replace("/");
        return;
      }

      //  boleh akses
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Lorem Ipsum</h1>

        <p className="text-gray-700 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </p>
      </main>
    </>
  );
}
