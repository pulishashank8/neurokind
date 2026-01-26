import { cookies } from 'next/headers';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  await cookies();
  return <OnboardingClient />;
}
