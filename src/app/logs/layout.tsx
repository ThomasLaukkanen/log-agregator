import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  return <div>{children}</div>;
}
