import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MenuItem } from "../App";

interface MenuPageProps {
  onAddToCart: (item: MenuItem) => void;
}

const categories = [
  "Coffee",
  "Tea", 
  "Cold Beverages",
  "Pastries",
  "Sandwiches",
  "Desserts",
	"NASTA"
];

export function MenuPage({ onAddToCart }: MenuPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("Coffee");
  const menuItems = useQuery(api.menu.getMenuItems) || [];

  const filteredItems = menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Navigation */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-lg font-semibold text-amber-800 mb-4">Menu Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-amber-800">{selectedCategory}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuItemCard({ item, onAddToCart }: { item: MenuItem; onAddToCart: (item: MenuItem) => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-200 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=${encodeURIComponent(item.name)}`;
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900">{item.name}</h4>
          <span className="text-lg font-bold text-amber-600">₹{item.price}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
        <button
          onClick={() => onAddToCart(item)}
          disabled={!item.available}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            item.available
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {item.available ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}
