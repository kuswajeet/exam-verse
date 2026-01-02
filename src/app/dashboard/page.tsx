import { redirect } from 'next/navigation';

export default function DashboardRoot() {
  // Automatically send users to the Tests page
  redirect('/dashboard/tests');
}