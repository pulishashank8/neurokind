import { cookies } from 'next/headers';
import NewPostClient from './NewPostClient';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  await cookies();
  return <NewPostClient />;
}
