import { Link } from 'react-router-dom';

const TYPE_LABELS = {
  rice: 'Rice',
  shawarma: 'Shawarma',
};

export default function MenuItemCard({ item }) {
  const startingPrice = item.sizes?.[0]?.price ?? item.shawarma_options?.[0]?.price;

  return (
    <Link
      to={`/menu/${item.id}`}
      className={`group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md ${
        item.is_available ? '' : 'pointer-events-none opacity-50'
      }`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">
            {TYPE_LABELS[item.item_type] || item.item_type}
          </span>
        </div>

        {item.description && (
          <p className="line-clamp-2 text-sm text-gray-500">{item.description}</p>
        )}

        <div className="mt-auto pt-2 text-sm font-semibold text-gray-900">
          {startingPrice != null ? `From ₦${Number(startingPrice).toLocaleString('en-NG')}` : ''}
        </div>

        {!item.is_available && (
          <span className="text-xs font-medium text-red-500">Currently unavailable</span>
        )}
      </div>
    </Link>
  );
}
