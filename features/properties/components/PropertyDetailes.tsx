// in the side bar it will show the property detailes like the price and the size and the location and the type of the property and also a image of the property and a button to contact the owner of the property
// he can buy, rent or lease the property and also a button to contact the owner of the property

import SideBar2 from "@/shared/components/comman/sideBar2";
import type { Property } from "@/shared/types";

export function PropertyDetailes({ property }: { property: Property }) {
  return (
    <SideBar2>
      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">{property.title}</h2>
        <p className="mb-2">
          <strong>Type:</strong> {property.type}
        </p>
        <p className="mb-2">
          <strong>Price:</strong> {property.price}
        </p>

        <p className="mb-2">
          <strong>Size:</strong> {property.size}
        </p>

        <p className="mb-2">
          <strong>Location:</strong> {property.district}, Karnataka
        </p>

        {/* Placeholder for property image */}
        <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">
          <span className="text-gray-500">Property Image</span>
        </div>

        <div className="flex gap-2">
          <button className="btn">Buy</button>
          <button className="btn">Rent</button>
          <button className="btn">Lease</button>
        </div>

        <div className="mt-4">
          <button className="btn">Contact Owner</button>
        </div>
      </div>
    </SideBar2>
  );
}
