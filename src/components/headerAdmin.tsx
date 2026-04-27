import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      //  panggil API untuk hapus cookies
      await fetch("/api/logout", {
        method: "POST",
      });

      //  redirect ke login
      router.push("/");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="text-xl font-bold text-gray-800">MyApp</div>

        <nav className="flex items-center gap-6">
          <Link
            href="/jumlahUserAdmin"
            className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            Jumlah User
          </Link>

          <Link
            href="/loremPageAdmin"
            className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            Lorem
          </Link>

          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 font-semibold transition-colors"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
