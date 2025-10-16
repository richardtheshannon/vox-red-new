import Link from 'next/link';

export default function AdminQuickActions() {
  return (
    <div className="h-full bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Admin Quick Actions</h3>
      <div className="space-y-2 text-xs text-gray-600">
        <Link href="/admin" className="block hover:text-gray-900">
          Admin Dashboard
        </Link>
        <Link href="/" className="block hover:text-gray-900">
          View Live Site
        </Link>
        <Link href="/admin/slides" className="block hover:text-gray-900">
          Manage Articles
        </Link>
      </div>
    </div>
  );
}
