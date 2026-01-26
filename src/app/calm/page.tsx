import { cookies } from 'next/headers';
import CalmClient from './CalmClient';

export const dynamic = 'force-dynamic';

export default async function CalmPage() {
  await cookies();
  return <CalmClient />;
}
