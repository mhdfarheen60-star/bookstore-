import { Link } from "react-router-dom";

function Pnf() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-3xl bg-gray-200 py-16 px-6 text-center">
        <h1 className="text-6xl font-bold text-black">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-black">Page Not Found</h2>
        <Link
          to="/"
          className="inline-block mt-8 px-8 py-3 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Pnf;