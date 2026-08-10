import { Link } from 'react-router-dom';

export default function MenuItemCard({ item }) {
  const startingPrice = item.sizes?.[0]?.price ?? item.shawarma_options?.[0]?.price;

  return (
    <Link
      to={`/menu/${item.id}`}
      className={`flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white ${
        item.is_available ? '' : 'pointer-events-none opacity-50'
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            No image
          </div>
        )}
        {startingPrice != null && (
          <span className="absolute bottom-2 left-2 rounded-full bg-brand-red px-3 py-1 text-xs font-bold text-white">
            ₦{Number(startingPrice).toLocaleString('en-NG')}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-3 py-2.5">
        <h3 className="truncate text-sm font-bold text-brand-black">{item.name}</h3>
        {!item.is_available && (
          <span className="text-xs font-medium text-brand-red">Currently unavailable</span>
        )}
      </div>
    </Link>
  );
}
