import Link from 'next/link';
import { cookies } from 'next/headers';
import { deleteStoredToken } from '@/utils/actions';
import { MdLogin, MdLogout } from 'react-icons/md';

export const Header = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  return (
    <header className="border-b ">
      <nav className="max-w-7xl mx-auto">
        <ul className="flex  items-center justify-between p-4 ">
          <li>
            <Link href="/" className="font-bold  text-2xl text-sky-500">
              📘 Verkstads Loggar
            </Link>
          </li>
          {token ? (
            <div className="flex gap-4 items-center">
              <li>
                <Link href="/logs" className="hover:underline">
                  Se Loggar
                </Link>
              </li>

              <li>
                <form action={deleteStoredToken} className=" ">
                  <button className="px-4 border rounded-lg cursor-pointer p-2 font-bold flex items-center gap-2">
                    <MdLogout /> <span>Logga ut</span>
                  </button>
                </form>
              </li>
            </div>
          ) : (
            <Link
              href="/login"
              className="border p-2 px-4 rounded-lg flex items-center gap-2 font-bold"
            >
              <MdLogin />
              <span> Logga in</span>
            </Link>
          )}
        </ul>
      </nav>
    </header>
  );
};
