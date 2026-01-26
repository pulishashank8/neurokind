import { cookies } from 'next/headers';
import MessagesClient from './MessagesClient';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  await cookies();
  return <MessagesClient />;
}
