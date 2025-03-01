export default function PropertyListingLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Form skeleton */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>

        {/* Form fields skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>

        {/* Textarea skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>

        {/* Button skeleton */}
        <div className="h-12 bg-gray-300 rounded w-full md:w-1/3"></div>
      </div>

      {/* Results skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>

        {/* Results items */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 animate-pulse"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3 h-48 bg-gray-200 rounded-lg"></div>
                <div className="w-full md:w-2/3 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
