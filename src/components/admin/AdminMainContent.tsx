export default function AdminMainContent() {
  return (
    <main className="absolute inset-0 overflow-y-auto" style={{padding: '50px'}}>
      <div className="hidden md:grid md:grid-cols-8 gap-4 h-full">
        {/* Left Column - 1/8 width */}
        <div className="col-span-1">
          <div className="h-full bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Admin Quick Actions</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p>Recent Activity</p>
              <p>User Approvals</p>
              <p>System Alerts</p>
              <p>Pending Reviews</p>
            </div>
          </div>
        </div>

        {/* Main Column - 6/8 width */}
        <div className="col-span-6">
          <h1 className="text-4xl font-bold mb-4 text-black">Admin Dashboard</h1>
          <p className="text-black mb-4">
            Welcome to the administrative interface. This area provides comprehensive management tools for bug reports, documentation, user management, and content library administration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Bug Reports</h2>
              <p className="text-red-600 text-sm">Track and manage system issues, user-reported bugs, and feature requests.</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Documentation</h2>
              <p className="text-blue-600 text-sm">Manage help articles, user guides, and system documentation.</p>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gray-100 rounded-lg border border-gray-300">
            <h2 className="text-2xl font-semibold text-black mb-4">Content Library Management</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded border">
                <p className="font-medium">Meditation</p>
                <p className="text-gray-600">125 items</p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <p className="font-medium">Yoga</p>
                <p className="text-gray-600">89 items</p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <p className="font-medium">Courses</p>
                <p className="text-gray-600">45 items</p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <p className="font-medium">Mantras</p>
                <p className="text-gray-600">67 items</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-2">Service Commitments Repository</h2>
            <p className="text-green-600 text-sm">Manage the collection of 50-100 service prompts that publish daily.</p>
            <div className="mt-3 text-sm text-green-700">
              <p>Active prompts: 73 | Published today: 1 | Queue: 72</p>
            </div>
          </div>
        </div>

        {/* Right Column - 1/8 width */}
        <div className="col-span-1">
          <div className="h-full bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">System Status</h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-gray-600">Server Status</p>
                <p className="text-green-600 font-medium">Online</p>
              </div>
              <div>
                <p className="text-gray-600">Active Users</p>
                <p className="text-black font-medium">1,247</p>
              </div>
              <div>
                <p className="text-gray-600">Storage Used</p>
                <p className="text-blue-600 font-medium">67%</p>
              </div>
              <div>
                <p className="text-gray-600">Open Tickets</p>
                <p className="text-orange-600 font-medium">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fallback - single column */}
      <div className="md:hidden">
        <h1 className="text-4xl font-bold mb-4 text-black">Admin Dashboard</h1>
        <p className="text-black mb-4">
          Administrative interface for managing bug reports, documentation, and system operations.
        </p>
        <div className="mt-6 p-6 bg-gray-100 rounded-lg border border-gray-300">
          <h2 className="text-2xl font-semibold text-black mb-2">Mobile Admin Panel</h2>
          <p className="text-gray-600">Simplified admin interface for mobile devices.</p>
        </div>
      </div>
    </main>
  );
}