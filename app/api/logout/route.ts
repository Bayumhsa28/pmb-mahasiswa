import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });

  //  HAPUS SEMUA COOKIE
  res.cookies.set("email", "", {
    maxAge: 0,
    path: "/",
  });

  res.cookies.set("role", "", {
    maxAge: 0,
    path: "/",
  });

  //hapus token
  res.cookies.set("token", "", {
    maxAge: 0,
    path: "/",
  });

  return res;
}