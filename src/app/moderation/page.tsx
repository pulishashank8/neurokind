import { cookies } from 'next/headers';
import ModerationClient from './ModerationClient';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  await cookies();
  return <ModerationClient />;
}
