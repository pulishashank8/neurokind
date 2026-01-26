import { cookies } from 'next/headers';
import ErrorClient from './ErrorClient';

export const dynamic = 'force-dynamic';

export default async function AuthErrorPage() {
  await cookies();
  return <ErrorClient />;
}
