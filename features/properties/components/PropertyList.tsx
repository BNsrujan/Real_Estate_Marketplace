// this file will contain a list of properties that will be displayed beside the side bar and when user clicks on the property in the side bar it self

import SideBar2 from "@/shared/components/comman/sideBar2";
import Link from "next/link";

export interface Property {
  id: string;
  title: string;
  type:
    | "house"
    | "site"
    | "agriculture land"
    | "commercial space"
    | "apartment"
    | "commercial plots";
  price: string;
  size: string;
  lat: number;
  lng: number;
  district: string;
}

export function PropertyCard({ property }: { property: Property }) {
  const TYPE_ICON: Record<Property["type"], string> = {
    house: "🏠",
    "agriculture land": "🌾",
    site: "📍",
    "commercial space": "🏢",
    apartment: "🏢",
    "commercial plots": "🏗️",
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="surface-top rounded-lg p-5 transition hover:scale-[1.02] cursor-pointer">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{TYPE_ICON[property.type]}</span>
          <span className="label">{property.type}</span>
        </div>

        <h3 className="text-lg font-semibold mb-1">{property.title}</h3>

        <p className="text-sm text-gray-500 mb-4">
          {property.district}, Karnataka
        </p>

        <div className="flex justify-between">
          <div>
            <p className="label">PRICE</p>
            <p className="font-medium">{property.price}</p>
          </div>
          <div>
            <p className="label">SIZE</p>
            <p className="font-medium">{property.size}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PropertyList({ properties }: { properties: Property[] }) {
  return (
    <SideBar2>
      <div className="space-y-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </SideBar2>
  );
}
