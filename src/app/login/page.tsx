'use client';
import { useActionState } from 'react';
import { login } from '@/utils/actions';
import { MdLogin } from 'react-icons/md';

export default function Page() {
  const [message, formAction, isPending] = useActionState(login, null);

  return (
    <main className="min-h-screen p-4 ">
      <form
        action={formAction}
        className="flex gap-2 flex-col mx-auto border w-full mt-20  p-4 max-w-72 rounded"
      >
        <label htmlFor="username">Användarnamn</label>
        <input id="username" type="text" name="username" className="bg-white text-black p-2" />
        <label htmlFor="password">Lösenord</label>
        <input id="password" type="password" name="password" className="bg-white text-black p-2" />
        <button
          type="submit"
          className="bg-red-700 rounded p-2 cursor-pointer flex items-center gap-2 justify-center font-bold"
        >
          <MdLogin />
          <span> Logga in</span>
        </button>
        {isPending ? 'Loggar in...' : message}
      </form>
    </main>
  );
}
