import { cookies } from 'next/headers';
import BookmarksClient from './BookmarksClient';

export const dynamic = 'force-dynamic';

export default async function BookmarksPage() {
  await cookies();
  return <BookmarksClient />;
}
