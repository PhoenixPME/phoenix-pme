export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600">Test Page</h1>
      <p className="text-gray-600 mt-2">If you see blue text, Tailwind is working!</p>
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
        <p className="font-medium">Gradient background test</p>
      </div>
    </div>
  );
}
