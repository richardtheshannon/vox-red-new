export default function MainContent() {
  return (
    <main className="absolute inset-0 overflow-y-auto" style={{padding: '50px'}}>
      <div className="hidden md:grid md:grid-cols-8 gap-4 h-full">
        {/* Left Column - 1/8 width */}
        <div className="col-span-1">
          <div className="h-full bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Left Panel</h3>
            <p className="text-xs text-gray-600">Side content or navigation</p>
          </div>
        </div>

        {/* Main Column - 6/8 width */}
        <div className="col-span-6">
          <h1 className="text-4xl font-bold mb-4 text-black">Main Content Area</h1>
          <p className="text-black mb-4">
            This is the central content area of the page. You can place any HTML content here, such as text, images, forms, or interactive components. The surrounding icons provide quick access to various functionalities or navigation links.
          </p>
          <p className="text-black mb-4">
            The layout is created using CSS Grid, which makes it easy to manage the positioning of the icon bars and the main content. It&apos;s also responsive, allowing the content to adapt to different screen sizes.
          </p>
          <div className="mt-6 p-6 bg-gray-100 rounded-lg border border-gray-300">
            <h2 className="text-2xl font-semibold text-black mb-2">Placeholder Section</h2>
            <p className="text-gray-600">This is an example of a nested container within the main content area.</p>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-black mt-8">Main Content Area</h1>
          <p className="text-black mb-4">
            This is the central content area of the page. You can place any HTML content here, such as text, images, forms, or interactive components. The surrounding icons provide quick access to various functionalities or navigation links.
          </p>
          <p className="text-black mb-4">
            The layout is created using CSS Grid, which makes it easy to manage the positioning of the icon bars and the main content. It&apos;s also responsive, allowing the content to adapt to different screen sizes.
          </p>
          <div className="mt-6 p-6 bg-gray-100 rounded-lg border border-gray-300">
            <h2 className="text-2xl font-semibold text-black mb-2">Placeholder Section</h2>
            <p className="text-gray-600">This is an example of a nested container within the main content area.</p>
          </div>
        </div>

        {/* Right Column - 1/8 width */}
        <div className="col-span-1">
          <div className="h-full bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Right Panel</h3>
            <p className="text-xs text-gray-600">Side content or widgets</p>
          </div>
        </div>
      </div>

      {/* Mobile fallback - single column */}
      <div className="md:hidden">
        <h1 className="text-4xl font-bold mb-4 text-black">Main Content Area</h1>
        <p className="text-black mb-4">
          This is the central content area of the page. You can place any HTML content here, such as text, images, forms, or interactive components. The surrounding icons provide quick access to various functionalities or navigation links.
        </p>
        <p className="text-black mb-4">
          The layout is created using CSS Grid, which makes it easy to manage the positioning of the icon bars and the main content. It&apos;s also responsive, allowing the content to adapt to different screen sizes.
        </p>
        <div className="mt-6 p-6 bg-gray-100 rounded-lg border border-gray-300">
          <h2 className="text-2xl font-semibold text-black mb-2">Placeholder Section</h2>
          <p className="text-gray-600">This is an example of a nested container within the main content area.</p>
        </div>
      </div>
    </main>
  );
}