'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: string | null, formData: FormData) {
  const rawFormData = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  };
  try {
    const token = await getToken(rawFormData.username, rawFormData.password);
    if (!token) {
      return 'Ingen användare hittad';
    }
    const cookieStore = await cookies();

    cookieStore.set('token', token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    } else {
      return 'Nånting gick fel med inloggningen';
    }
  }
  redirect('/logs');

  return 'Hittade användare!';
}

export type WorkshopsType = {
  id: number;
  name: string;
  serial: string;
  logs: string[];
}[];
export const getWorkshops = async (): Promise<WorkshopsType> => {
  const token = await getStoredToken();

  if (!token) {
    redirect('login');
  }

  const res = await fetch('https://wfm-base-api.azurewebsites.net/api/Workshop', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok || res.status !== 200)
    throw new Error('Nånting gick fel prova att göra samma sak igen');

  return await res.json();
};

export const getStoredToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
};
export const deleteStoredToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/');
};

export type LogsType = {
  rawData: string;
};

export const getLogs = async (id: string, date: string): Promise<LogsType> => {
  const token = await getStoredToken();
  console.log(date);
  if (!token) {
    redirect('login');
  }
  const res = await fetch(
    `https://wfm-base-api.azurewebsites.net/api/Workshop/${id}/logs/GetLog?date=${date}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(res);
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok || res.status !== 200) throw new Error('Nånting gick fel');

  return await res.json();
};

export const getToken = async (username: string, password: string): Promise<string> => {
  console.log({ username, password });
  const res = await fetch('https://wfm-base-api.azurewebsites.net/api/Authentication', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });
  if (res.status === 401) throw new Error('Hittade ingen användare');
  if (!res.ok || res.status !== 200) throw new Error('Nånting gick fel under inloggningen');

  const data = await res.json();
  if (!data.token) {
    throw new Error('Nånting gick fel under inloggningen');
  }

  return data.token;
};
