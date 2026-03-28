import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchPropertyById } from "@/features/properties/services/propertyService";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await fetchPropertyById(id);
  if (!property) notFound();

  return (
    <main className="min-h-screen surface">
      {/* NAV */}
      <nav className="sticky top-0 z-50 glass px-4 sm:px-6 h-16 flex items-center justify-between flex-wrap gap-2">
        <Link href="/" className="display text-sm">
          NAMMA DHARANI
        </Link>

        <Link
          href="/properties"
          className="text-xs tracking-widest text-gray-500"
        >
          ← ALL PROPERTIES
        </Link>
      </nav>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* HERO */}
        <div className="aspect-video surface-low rounded-lg mb-10 flex items-center justify-center relative">
          <div className="text-6xl opacity-20">
            {property.type === "house"
              ? "🏠"
              : property.type === "land"
                ? "🌱"
                : "🏢"}
          </div>

          <div className="absolute left-0 top-0 w-1 h-16 bg-red-700" />
        </div>

        {/* TITLE */}
        <div className="mb-10">
          <p className="label mb-2">{property.type}</p>

          <h1 className="display text-3xl sm:text-5xl mb-2">
            {property.title}
          </h1>

          <p className="text-sm text-gray-500">
            📍 {property.district}, Karnataka
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200 rounded-lg overflow-hidden mb-10">
          {[
            { label: "PRICE", value: `₹${property.price}` },
            { label: "AREA", value: property.size },
            { label: "TYPE", value: property.type },
            { label: "DISTRICT", value: property.district },
          ].map((item) => (
            <div key={item.label} className="bg-white p-4">
              <p className="label">{item.label}</p>
              <p className="display text-lg mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 text-center bg-red-700 text-white py-3 rounded-md font-semibold"
          >
            View on Globe →
          </Link>

          <Link
            href="/properties"
            className="flex-1 text-center surface-low py-3 rounded-md font-semibold"
          >
            ← All Properties
          </Link>
        </div>
      </div>
    </main>
  );
}
